import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'argon2';
import { $Enums, AccessLevel, Prisma, PrismaClient } from './client.js';
import moment from 'moment-timezone';
import { isObject } from 'class-validator';
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });
import { keyBy, map } from 'lodash';

const grade: { name: string; employeeType: $Enums.EmployeeType }[] = [
  { name: 'Directeur', employeeType: 'FONCTIONNAIRE' },
  { name: 'Directeur Adjoint', employeeType: 'FONCTIONNAIRE' },
  { name: 'Chef de Service', employeeType: 'FONCTIONNAIRE' },
  { name: 'Ass. Chef de Service', employeeType: 'FONCTIONNAIRE' },
  { name: 'Chef de Section', employeeType: 'FONCTIONNAIRE' },
  { name: 'Professionnel Senior I', employeeType: 'FONCTIONNAIRE' },
  { name: 'Professionnel Senior IV', employeeType: 'FONCTIONNAIRE' },
  { name: 'Professionnel Junior I', employeeType: 'FONCTIONNAIRE' },
  { name: 'Professionnel Junior III', employeeType: 'FONCTIONNAIRE' },
  { name: 'Inspecteur I', employeeType: 'FONCTIONNAIRE' },
  { name: 'Inspecteur II', employeeType: 'FONCTIONNAIRE' },
  { name: 'Inspecteur III', employeeType: 'FONCTIONNAIRE' },
  { name: 'Inspecteur IV', employeeType: 'FONCTIONNAIRE' },
  { name: 'Agent Niveau I', employeeType: 'FONCTIONNAIRE' },
  { name: 'Agent Niveau II', employeeType: 'FONCTIONNAIRE' },
  { name: 'Agent Niveau III', employeeType: 'FONCTIONNAIRE' },
  { name: 'Comptable I', employeeType: 'FONCTIONNAIRE' },
  { name: 'Agent administratif', employeeType: 'FONCTIONNAIRE' },
  { name: 'Agente Administrative', employeeType: 'FONCTIONNAIRE' },
];

const gradeSalary: Record<
  string,
  {
    affectationType?: $Enums.AffectationType | undefined;
    minSalary: number;
    maxSalary: number;
    levelData?: number | undefined;
    fiscalYear: number;
  }
> = {
  Directeur: {
    affectationType: 'DIRECTION',
    minSalary: 160000,
    maxSalary: 283449.76,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Directeur-Adjoint': {
    affectationType: $Enums.AffectationType.DIRECTION,

    minSalary: 140000.0,
    maxSalary: 248018.54,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Chef de Service': {
    affectationType: $Enums.AffectationType.SERVICE,

    minSalary: 80000,
    maxSalary: 141724.88,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Chef de Section': {
    affectationType: $Enums.AffectationType.SECTION,

    minSalary: 55000,
    maxSalary: 97435.855,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  Inspecteur: {
    minSalary: 55000,
    maxSalary: 97435.855,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Professionnel Senor': {
    minSalary: 90000,
    maxSalary: 159440.49,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Professionnel Junior': {
    minSalary: 55000,
    maxSalary: 97435.855,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Agents de Niveau I': {
    minSalary: 50000,
    maxSalary: 88578.05,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Agents de Niveau II': {
    minSalary: 45000,
    maxSalary: 79720.245,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  stagiaire: {
    minSalary: 30000,
    maxSalary: 30000,
    fiscalYear: 2023,
  },
  'Contractuel 1': {
    minSalary: 45000,
    maxSalary: 90000,
    levelData: 1.1,
    fiscalYear: 2023,
  },
  'Contractuel 2': {
    minSalary: 60000,
    maxSalary: 120000,
    levelData: 1.1,
    fiscalYear: 2023,
  },
};

const leavePolicies: {
  type: $Enums.LeavePolicyType;
  label: string;
  tiers: number | Record<number, number>;
}[] = [
  {
    type: 'ANNUAL',
    label: 'Congé Annuel',
    tiers: { 1: 15, 6: 20, 11: 25 },
  },
  {
    type: 'SPECIAL',
    label: 'Congé Spécial',
    tiers: 5,
  },
  {
    type: 'SICK',
    label: 'Congé Maladie',
    tiers: 30,
  },
  {
    type: 'LONG_LASTING',
    label: 'Congé de Long Durée',
    tiers: 5,
  },
  {
    type: 'TRAINING',
    label: 'Congé de Formation',
    tiers: 30,
  },
  {
    type: 'PARENTAL',
    label: 'Congé de Parentale',
    tiers: 5,
  },
  {
    type: 'MATERNITY',
    label: 'Congé de Maternité',
    tiers: 30,
  },
];

async function main() {
  const modulations = [
    { name: 'AM' },
    { name: 'FM' },
    { name: 'FMCW' },
    { name: 'GFSK' },
    { name: 'QPSK' },
    { name: '16-QAM' },
    { name: '64-QAM' },
    { name: '256-QAM' },
    { name: 'OFDM' },
    { name: 'LoRa' },
  ];
  try {
    await createGradeAffectation();
    const user = await createUser();
    await createLeavePolicy();

    if (!user.employee.statusId) {
      await createMovement('DIT', 'Professionnel Junior', user.id);
    }
  } catch (error) {
    console.log('user Already Exisit', error);
  }
}

async function createUser() {
  const privs = await createPivileges();
  const appModule = await createModule();
  const typeDocument = await createTypeDocuments();
  const userData: Prisma.UsersCreateInput = {
    employee: {
      create: {
        firstName: 'Frantzly',
        lastName: 'DUMENY',
        sexe: 'M',
        dob: moment('16/07/1992', 'DD/MM/YYYY').toDate(),
        phone: '+509 4796-1001',
        ninu: '1344236380',
        nif: '004-904-858-4',
        email: 'diegotus1992@gmail.com',
        bloodGroup: 'O_POSITIVE',
        hireDate: '2023-10-01T05:00:00Z',
      },
    },
    password: await hash('Wedena92@'),
    role: {
      create: {
        id: 'Admin',
        rolePrivs: {
          create: privs.reduce(
            (result: Prisma.RolePrivCreateWithoutRoleInput[], item) => {
              result.push(
                ...Object.values(AccessLevel).map((val) => {
                  return {
                    accessLevel: val,
                    privilege: {
                      connect: {
                        code: item.code,
                      },
                    },
                  };
                }),
              );

              return result;
            },
            [],
          ),
        },
        modulePrivs: {
          create: appModule.reduce(
            (result: Prisma.ModulePrivCreateWithoutRoleInput[], item) => {
              result.push({
                module: { connect: { id: item.id } },
              });
              return result;
            },
            [],
          ),
        },
        documentPrivs: {
          create: typeDocument.reduce(
            (
              result: Prisma.DocumentPrivUncheckedCreateWithoutRoleInput[],
              item,
            ) => {
              result.push(
                ...Object.values(AccessLevel).map((val) => {
                  return {
                    accessLevel: val,
                    typeDocumentId: item.id,
                  };
                }),
              );

              return result;
            },
            [],
          ),
        },
      },
    },
    status: 'ACTIVE',
  };

  const employee = await prisma.employee.findUnique({
    where: {
      nif: userData.employee.create?.nif,
    },
  });
  const user = await prisma.users.upsert({
    where: {
      id: employee?.id || -1,
    },
    update: {},
    create: userData,
    include: {
      employee: true,
    },
  });
  return user;
}

async function createPivileges() {
  await prisma.privileges.createMany({
    data: [
      { code: 'APP_ADMIN', label: "Gestion De l'application" },
      { code: 'USERS', label: 'Gestion Des Utilisateurs' },
      { code: 'ROLES', label: 'Gestion Des Roles' },
      { code: 'PRIVILEGE', label: 'Gestion Des Privileges' },
      { code: 'APP_MODULE', label: 'Gestion Des MODULES' },
      { code: 'GRADE', label: 'Gestion Des Grades' },
      { code: 'AFFECTATION', label: 'Gestion Des Affectation' },
      { code: 'SALARY_GRID', label: 'Gestion De la Grille de Salaire' },
      { code: 'FEES', label: 'Gestion Des Frais' },
      { code: 'POLICY_LEAVE', label: 'Gestion Du  Politique de Congé' },
      { code: 'DOCUMENT_TYPES', label: 'Gestion Du Type des Documents' },
      { code: 'MOVEMENT', label: 'Gestion Mouvemen' },
      { code: 'LEAVE', label: 'Gestion Congé' },
      { code: 'CONTROL_PRESENCE', label: 'Gestion Presence' },
    ],
    skipDuplicates: true,
  });
  const privs = await prisma.privileges.findMany();

  return privs;
}

async function createTypeDocuments() {
  await prisma.typeDocuments.createMany({
    skipDuplicates: true,
    data: [
      {
        type: 'TRAINING',
        code: 'EMPLOYEE_TRANING',
        label: 'Certificat, Licence, Master, Doctorat',
      },
      { type: 'MOVEMENT', code: 'MV_PROMOTION', label: 'Promotion' },
      {
        type: 'MOVEMENT',
        code: 'DOTATION_NOMINATION',
        label: 'Datation Nomination',
      },
      {
        type: 'MOVEMENT',
        code: 'DOTATION_CONTRACT',
        label: 'Dotation Contract',
      },
      { type: 'MOVEMENT', code: 'DOTATION_STAGE', label: 'Dotation Stage' },
      { type: 'MOVEMENT', code: 'MV_MUTATION', label: 'Mutation Pers' },
      {
        type: 'ATTESTATION',
        code: 'ATTESTATION_EMPLOYEE',
        label: 'Attestation Employee',
      },
      { type: 'LEAVES', code: 'EMPLOYEE_LEAVES', label: 'Congé des employees' },
    ],
  });
  return await prisma.typeDocuments.findMany();
}

async function createLeavePolicy() {
  const documents = await prisma.typeDocuments.findFirst({
    where: { type: 'LEAVES' },
  });

  await prisma.leavePolicy.createMany({
    skipDuplicates: true,
    data: leavePolicies.map((val) => {
      return {
        type: val.type,
        label: val.label,
        typeDocumentId: documents?.id,
      };
    }),
  });
  await createLeaveTiers();
  return await prisma.typeDocuments.findMany();
}

async function createLeaveTiers() {
  const leavePoliciesOnline = await prisma.leavePolicy.findMany();
  const leavePolicy = keyBy(leavePolicies, 'type');
  await prisma.leaveTier.createMany({
    skipDuplicates: true,
    data: leavePoliciesOnline.reduce((result: any, val) => {
      const tieres = isObject(leavePolicy[val.type].tiers)
        ? map(
            leavePolicy[val.type].tiers as Record<number, number>,
            (value: number, key: number) => {
              return { minYearsService: key, daysAvailable: value };
            },
          )
        : [{ minYearsService: 0, daysAvailable: leavePolicy[val.type].tiers }];

      result.push(
        ...(tieres as Record<string, any>[]).map((tier) => {
          return {
            policyId: val.id,
            ...tier,
          };
        }),
      );
      return result;
    }, []),
  });
}

async function createModule() {
  await prisma.appModule.createMany({
    skipDuplicates: true,
    data: [
      { id: 'DG', label: 'DG' },
      { id: 'DARH', label: 'DARH' },
      { id: 'DEEM', label: 'DEEM' },
      { id: 'LOGISTIQUE', label: 'Logistique' },
      { id: 'HOMOLOGATION', label: 'Homologation' },
    ],
  });
  return await prisma.appModule.findMany();
}

async function createGradeAffectation() {
  await prisma.grade.createMany({
    data: grade,
    skipDuplicates: true,
  });
  const data = await prisma.grade.createManyAndReturn({
    skipDuplicates: true,
    data: map(gradeSalary, (value, key) => {
      let employeeType: $Enums.EmployeeType = 'FONCTIONNAIRE';
      if (key.toLocaleLowerCase() == 'stagiaire') {
        employeeType = 'STAGIAIRE';
      } else if (key.toLocaleLowerCase().includes('Contractuel')) {
        employeeType = 'CONTRACTUAL';
      }
      return {
        name: key,
        employeeType,
        affectationType: value['affectationType'],
        isApproved: true,
      };
    }),
  });

  for (const val of data) {
    const salaryGrid = gradeSalary[val.name];
    await prisma.salaryGrid.create({
      data: {
        minSalary: salaryGrid.minSalary,
        maxSalary: salaryGrid.maxSalary,
        levelData: salaryGrid.levelData,
        fiscalYear: salaryGrid.fiscalYear,
        grade: { connect: { id: val.id } },
      },
    });
  }

  await prisma.affectation.createMany({
    data: [
      {
        name: 'Générale',
        sigle: 'DG',
        type: 'DIRECTION',
      },
      {
        name: 'Ressources Humaines',
        sigle: 'DARH',
        type: 'DIRECTION',
      },
      {
        name: 'Informatique',
        sigle: 'DIT',
        type: 'DIRECTION',
      },
    ],
    skipDuplicates: true,
  });
}

async function createMovement(
  affectationSigle: string,
  gradeName: string,
  employeeId?: number,
) {
  if (employeeId) {
    await prisma.movementPersonel.create({
      data: {
        type: 'DOTATION',
        dotationType: 'NOMINATION',
        approved: true,
        startDate: moment('01/10/2024', 'DD/MM/YYYY').toDate(),
        status: {
          create: {
            employee: {
              connect: {
                id: employeeId,
              },
            },
            startDate: moment('01/10/2024', 'DD/MM/YYYY').toDate(),
            grade: { connect: { name: gradeName } },
            affectation: {
              connect: { sigle: affectationSigle },
            },
            initialSalary: 0,
          },
        },
        employee: {
          connect: {
            id: employeeId,
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
