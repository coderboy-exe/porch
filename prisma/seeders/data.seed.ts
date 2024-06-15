import { PrismaClient } from '@prisma/client';
const XLSX = require('xlsx');

const prisma = new PrismaClient()

const excelDateToJSDate = (serial) => {
  // Convert Excel date to JavaScript date
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

const parseBoolean = (value) => {
  return value === 'TRUE' || value === 'true' || value === true;
};

const getOrAddUser = async (email: string, firstName?: string, lastName?: string) => {
  // GET A USER IF TEY EXIST OR ADD THEM
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName
        }
      })
      return newUser
    }
    return existingUser
  } catch (err) {
    console.error('An error occured while fetching user: ', err)
  }
}

const createMembership = async (
  membershipId: number, userId: number, type: string,
  totalAmount: number, isFirstMonth: boolean,
  startDate: Date | string, dueDate: Date | string
) => {
  try {
    const membership = await prisma.membership.create({
      data: {
        id: membershipId,
        userId,
        type,
        totalAmount,
        isFirstMonth: parseBoolean(isFirstMonth),
        startDate,
        dueDate
      }
    })
    return membership
  } catch (err) {
    console.error("An error occured while creating the Membership entry: ", err)
  }
}

const createAddOnEntry = async (
  addOnId: number, name: string, membershipId: number,
  monthlyAmount: number, dueDate: Date | string
) => {
  try {
    const addOn = await prisma.addOnService.create({
      data: {
        id: addOnId,
        name,
        membershipId,
        monthlyAmount,
        dueDate
      }
    })
    return addOn
  } catch (err) {
    console.error("An error occured: ", err)
  }
}


async function seedMemberships() {
  try {
    // Load the Excel file
    const workbook = XLSX.readFile('prisma/data/Fitness+ Dataset.xlsx');

    // Process "Membership Table" sheet
    const membershipSheet = workbook.Sheets['Membership Table'];
    const membershipData = XLSX.utils.sheet_to_json(membershipSheet);

    console.log('RECCC: ', membershipData);

    for (const row of membershipData) {
      const {
        MembershipID,
        FirstName,
        LastName,
        MembershipType,
        StartDate,
        DueDate,
        TotalAmount,
        Email,
        IsFirstMonth
      } = row

      const user = await getOrAddUser(Email, FirstName, LastName);
      const startDate = excelDateToJSDate(StartDate);
      const dueDate = excelDateToJSDate(DueDate);

      await createMembership(
        MembershipID, user.id, MembershipType,
        TotalAmount, IsFirstMonth, startDate, dueDate
      )
    }
  } catch (err) {
    console.error("An error occured while processing the sheet: ", err)
  }
  console.log('Membership Table sheet successfully processed');
}


async function seedAddOns() {
  try {
    // Load the Excel file
    const workbook = XLSX.readFile('prisma/data/Fitness+ Dataset.xlsx');

    // Process "Membership Table" sheet
    const addOnsSheet = workbook.Sheets['AddOnServices Table'];
    const addOnsData = XLSX.utils.sheet_to_json(addOnsSheet);

    console.log('RECCC: ', addOnsData);

    for (const row of addOnsData) {
      const {
        AddOnID,
        MembershipID,
        ServiceName,
        MonthlyAmount,
        DueDate,
      } = row

      const dueDate = excelDateToJSDate(DueDate)
      await createAddOnEntry(
        AddOnID, ServiceName, MembershipID, MonthlyAmount, dueDate
      )

    }
  } catch (err) {
    console.error("An error occured while processing the sheet: ", err)
  }
  console.log('AddOns Table sheet successfully processed');
}




seedMemberships()
  .then(async (response) => {
    console.log(response);
    seedAddOns()
      .catch((error) => {
        console.error(`Error seeding data: ${error.message}`);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  })
  .catch((error) => {
    console.error(`Error seeding data: ${error.message}`);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });