-- This is an empty migration.
CREATE
OR REPLACE VIEW "EmployeeLeaveStatus" AS WITH AgentSeniority AS (
    SELECT
        id as "employeeId",
        "hireDate",
        CASE
            WHEN "hireDate" IS NULL THEN 0
            ELSE EXTRACT(
                YEAR
                FROM
                    AGE(CURRENT_DATE, "hireDate")
            )
        END as years_service,
        CASE
            WHEN EXTRACT(
                MONTH
                FROM
                    CURRENT_DATE
            ) >= 10 THEN EXTRACT(
                YEAR
                FROM
                    CURRENT_DATE
            ) + 1
            ELSE EXTRACT(
                YEAR
                FROM
                    CURRENT_DATE
            )
        END as current_fiscal_year,
        CASE
            WHEN EXTRACT(
                MONTH
                FROM
                    CURRENT_DATE
            ) BETWEEN 4
            AND 9 THEN TRUE
            ELSE FALSE
        END as is_grace_period_expired,
        (
            CASE
                WHEN EXTRACT(
                    MONTH
                    FROM
                        CURRENT_DATE
                ) >= 10 THEN (
                    EXTRACT(
                        YEAR
                        FROM
                            CURRENT_DATE
                    ) :: text || '-10-01'
                ) :: date
                ELSE (
                    (
                        EXTRACT(
                            YEAR
                            FROM
                                CURRENT_DATE
                        ) - 1
                    ) :: text || '-10-01'
                ) :: date
            END
        ) as fiscal_year_start
    FROM
        "Employee"
),
PolicyAllowances AS (
    SELECT
        s.*,
        lp.id as "policyId",
        lp.type as "policyType",
        COALESCE(
            (
                SELECT
                    lt."daysAvailable"
                FROM
                    "LeaveTier" lt
                WHERE
                    lt."policyId" = lp.id
                    AND s.years_service >= lt."minYearsService"
                ORDER BY
                    lt."minYearsService" DESC
                LIMIT
                    1
            ), 0
        ) as allowed_days
    FROM
        AgentSeniority s
        CROSS JOIN "LeavePolicy" lp
),
LeaveUsage AS (
    SELECT
        lr."employeeId",
        lr."type" as "leaveType",
        SUM(lr."daysRequested") as total_used
    FROM
        "EmployeeLeavesRequest" lr
        JOIN AgentSeniority s ON s."employeeId" = lr."employeeId"
    WHERE
        lr.approved = true
        AND lr."startDate" >= s.fiscal_year_start
        AND lr."startDate" <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
    GROUP BY
        lr."employeeId",
        lr."type"
) -- 4. Final Result: Carry over is now matched per Policy
SELECT
    (a."employeeId" || '-' || a."policyType") as id,
    a."employeeId",
    a."policyId",
    a."policyType",
    a."hireDate",
    a.years_service,
    a.allowed_days as new_days,
    CASE
        WHEN a.is_grace_period_expired THEN 0
        ELSE COALESCE(coh.amount, 0)
    END as carry_over_available,
    COALESCE(u.total_used, 0) as days_already_used,
    (
        a.allowed_days + (
            CASE
                WHEN a.is_grace_period_expired THEN 0
                ELSE COALESCE(coh.amount, 0)
            END
        ) - COALESCE(u.total_used, 0)
    ) as current_balance,
    EXISTS (
        SELECT
            1
        FROM
            "EmployeeLeavesRequest" lr
        WHERE
            lr."employeeId" = a."employeeId"
            AND lr."type" = a."policyType"
            AND lr.approved = true
            AND (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') BETWEEN lr."startDate"
            AND lr."endDate"
    ) as is_on_leave
FROM
    PolicyAllowances a
    LEFT JOIN LeaveUsage u ON a."employeeId" = u."employeeId"
    AND a."policyType" = u."leaveType" -- JOINING ON BOTH Employee AND Policy
    LEFT JOIN "CarriedOverHistory" coh ON a."employeeId" = coh."employeeId"
    AND a."policyId" = coh."policyId"
    AND coh.year = a.current_fiscal_year;