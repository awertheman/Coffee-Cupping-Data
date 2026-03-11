import { Router, type IRouter } from "express";
import { db, cuppingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/cuppings", async (_req, res) => {
  try {
    const cuppings = await db
      .select()
      .from(cuppingsTable)
      .orderBy(cuppingsTable.createdAt);
    res.json(cuppings.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cuppings", async (req, res) => {
  try {
    const data = req.body;
    const [cupping] = await db
      .insert(cuppingsTable)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    res.status(201).json(cupping);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cuppings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [cupping] = await db
      .select()
      .from(cuppingsTable)
      .where(eq(cuppingsTable.id, id));
    if (!cupping) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(cupping);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cuppings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const [cupping] = await db
      .update(cuppingsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cuppingsTable.id, id))
      .returning();
    if (!cupping) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(cupping);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cuppings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(cuppingsTable).where(eq(cuppingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
