import { PrismaClient } from '@prisma/client';
import { Contact } from '@prisma/client';

const prisma = new PrismaClient();

interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

interface ConsolidatedContact {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export const reconcileContact = async (data: IdentifyRequest): Promise<ConsolidatedContact> => {
  const { email, phoneNumber } = data;

  // Find contacts that match either email or phone number
  const matchingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email ?? undefined },
        { phoneNumber: phoneNumber ?? undefined },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (matchingContacts.length === 0) {
    // Scenario 1: No existing contacts found. Create a new primary contact.
    const newContact = await prisma.contact.create({
      data: {
        email: email,
        phoneNumber: phoneNumber,
        linkPrecedence: 'primary',
      },
    });
    return formatResponse([newContact]);
  }

  // Identify the primary contact and related secondary contacts
  let primaryContact = matchingContacts.find(c => c.linkPrecedence === 'primary')!;
  
  // If no primary is found directly, find it through a secondary contact's linkedId
  if (!primaryContact && matchingContacts[0].linkedId) {
      const foundPrimary = await prisma.contact.findUnique({ where: { id: matchingContacts[0].linkedId }});
      if(foundPrimary) primaryContact = foundPrimary;
  }
  // If still no primary (edge case of only secondaries), the oldest contact becomes primary
  if (!primaryContact) primaryContact = matchingContacts[0];


  const linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id }
      ]
    }
  });


  const allRelatedContacts = [...new Set([...matchingContacts, ...linkedContacts])];

  const primaryContactsInSet = allRelatedContacts.filter(c => c.linkPrecedence === 'primary');

  if (primaryContactsInSet.length > 1) {
    // Scenario 4: Merge two primary contacts. The oldest one remains primary.
    const oldestPrimary = primaryContactsInSet[0]; // Already sorted by createdAt
    const otherPrimaries = primaryContactsInSet.slice(1);

    for (const contactToDemote of otherPrimaries) {
      await prisma.contact.update({
        where: { id: contactToDemote.id },
        data: {
          linkedId: oldestPrimary.id,
          linkPrecedence: 'secondary',
        },
      });
    }
    // Refresh primary contact and the set of all contacts
    primaryContact = oldestPrimary;
    const allContactsAfterMerge = await prisma.contact.findMany({
      where: {
        OR: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
      },
    });
    return formatResponse(allContactsAfterMerge);
  }

  // Check if a new secondary contact needs to be created
  const newEmail = email && !allRelatedContacts.some(c => c.email === email);
  const newPhoneNumber = phoneNumber && !allRelatedContacts.some(c => c.phoneNumber === phoneNumber);

  if (newEmail || newPhoneNumber) {
    // Scenario 2: Create a new secondary contact
    const newSecondaryContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      },
    });
    allRelatedContacts.push(newSecondaryContact);
  }

  // Scenario 3: Return existing consolidated contact
  return formatResponse(allRelatedContacts, primaryContact);
};


const formatResponse = (contacts: Contact[], primary?: Contact): ConsolidatedContact => {
    let primaryContact = primary || contacts.find(c => c.linkPrecedence === 'primary') || contacts[0];
  
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];
  
    // Add primary contact details first to ensure order
    if (primaryContact.email) emails.add(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);
  
    contacts.forEach(contact => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.id !== primaryContact.id) {
        secondaryContactIds.push(contact.id);
      }
    });
  
    return {
      primaryContatctId: primaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds: [...new Set(secondaryContactIds)], // Ensure uniqueness
    };
  };