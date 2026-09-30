import { Router, type IRouter } from "express";
import { asc, eq, ilike, or, sql } from "drizzle-orm";
import {
  CreateContactBody,
  CreateContactResponse,
  DeleteContactParams,
  GetContactParams,
  GetContactResponse,
  GetContactSummaryResponse,
  ListContactsQueryParams,
  ListContactsResponse,
  UpdateContactBody,
  UpdateContactParams,
  UpdateContactResponse,
} from "@workspace/api-zod";
import { contactsTable, db } from "@workspace/db";

const router: IRouter = Router();

router.get("/contacts", async (req, res): Promise<void> => {
  const parsedQuery = ListContactsQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const search = parsedQuery.data.search.trim();
  const contacts = await db
    .select()
    .from(contactsTable)
    .where(
      search
        ? or(
            ilike(contactsTable.name, `%${search}%`),
            ilike(contactsTable.phoneNumber, `%${search}%`),
            ilike(contactsTable.relationship, `%${search}%`),
            ilike(contactsTable.address, `%${search}%`),
          )
        : undefined,
    )
    .orderBy(asc(contactsTable.name));

  res.json(ListContactsResponse.parse(contacts));
});

router.post("/contacts", async (req, res): Promise<void> => {
  const parsedBody = CreateContactBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [contact] = await db
    .insert(contactsTable)
    .values(parsedBody.data)
    .returning();

  res.status(201).json(CreateContactResponse.parse(contact));
});

router.get("/contacts/summary", async (_req, res): Promise<void> => {
  const [totalResult, relationshipRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(contactsTable),
    db
      .select({
        relationship: contactsTable.relationship,
        count: sql<number>`count(*)`,
      })
      .from(contactsTable)
      .groupBy(contactsTable.relationship)
      .orderBy(asc(contactsTable.relationship)),
  ]);

  const summary = {
    total: Number(totalResult[0]?.count ?? 0),
    relationships: relationshipRows.map((row) => ({
      relationship: row.relationship,
      count: Number(row.count),
    })),
  };

  res.json(GetContactSummaryResponse.parse(summary));
});

router.get("/contacts/:id", async (req, res): Promise<void> => {
  const parsedParams = GetContactParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, parsedParams.data.id));

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.json(GetContactResponse.parse(contact));
});

router.patch("/contacts/:id", async (req, res): Promise<void> => {
  const parsedParams = UpdateContactParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const parsedBody = UpdateContactBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [contact] = await db
    .update(contactsTable)
    .set({ ...parsedBody.data, updatedAt: new Date() })
    .where(eq(contactsTable.id, parsedParams.data.id))
    .returning();

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.json(UpdateContactResponse.parse(contact));
});

router.delete("/contacts/:id", async (req, res): Promise<void> => {
  const parsedParams = DeleteContactParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [contact] = await db
    .delete(contactsTable)
    .where(eq(contactsTable.id, parsedParams.data.id))
    .returning({ id: contactsTable.id });

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;