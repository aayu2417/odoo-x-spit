import { getDb } from "./mongodb";
import type {
  Product,
  Receipt,
  Delivery,
  Transfer,
  AuditLog,
  Warehouse,
  Unit,
  StockMovement,
  Adjustment,
  Organization,
  User,
} from "./models";

// Helper to get organizationId from request headers
function getOrganizationId(request?: Request): string | null {
  if (!request) return null;
  return request.headers.get("x-organization-id");
}

// Database functions using MongoDB with organization support
export const db = {
  organizations: {
    getAll: async () => {
      const database = await getDb();
      const orgs = await database
        .collection<Organization>("organizations")
        .find({})
        .toArray();
      return orgs.map(({ _id, ...org }) => ({
        ...org,
        id: org.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string) => {
      const database = await getDb();
      const org = await database
        .collection<Organization>("organizations")
        .findOne({ id });
      if (!org) return null;
      const { _id, ...rest } = org;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    getByName: async (name: string) => {
      const database = await getDb();
      // Case-insensitive search for organization by name
      const org = await database
        .collection<Organization>("organizations")
        .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (!org) return null;
      const { _id, ...rest } = org;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Organization, "id" | "createdAt">) => {
      const database = await getDb();
      const newOrg: Organization = {
        ...data,
        id: `ORG-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database
        .collection<Organization>("organizations")
        .insertOne(newOrg);
      return newOrg;
    },
  },
  users: {
    getByEmail: async (email: string) => {
      const database = await getDb();
      const user = await database.collection<User>("users").findOne({ email });
      if (!user) return null;
      const { _id, password, ...rest } = user;
      return { ...rest, id: rest.id || _id?.toString() || "", password }; // Include password for verification
    },
    getById: async (id: string) => {
      const database = await getDb();
      const user = await database.collection<User>("users").findOne({ id });
      if (!user) return null;
      const { _id, password, ...rest } = user;
      return { ...rest, id: rest.id || _id?.toString() || "", password };
    },
    create: async (data: Omit<User, "id" | "createdAt">) => {
      const database = await getDb();
      const newUser: User = {
        ...data,
        id: `USER-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database.collection<User>("users").insertOne(newUser);
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as Omit<User, "password">;
    },
  },
  products: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const products = await database
        .collection<Product>("products")
        .find({ organizationId })
        .toArray();
      return products.map(({ _id, ...product }) => ({
        ...product,
        id: product.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const product = await database
        .collection<Product>("products")
        .findOne({ id, organizationId });
      if (!product) return null;
      const { _id, ...rest } = product;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Product, "id" | "createdAt">) => {
      const database = await getDb();
      const newProduct: Product = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      await database.collection<Product>("products").insertOne(newProduct);
      return newProduct;
    },
    update: async (
      id: string,
      organizationId: string,
      data: Partial<Product>
    ) => {
      const database = await getDb();
      const result = await database
        .collection<Product>("products")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Product>("products")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
  receipts: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const receipts = await database
        .collection<Receipt>("receipts")
        .find({ organizationId })
        .toArray();
      return receipts.map(({ _id, ...receipt }) => ({
        ...receipt,
        id: receipt.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const receipt = await database
        .collection<Receipt>("receipts")
        .findOne({ id, organizationId });
      if (!receipt) return null;
      const { _id, ...rest } = receipt;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Receipt, "id" | "createdAt">) => {
      const database = await getDb();
      const newReceipt: Receipt = {
        ...data,
        id: `RCP-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database.collection<Receipt>("receipts").insertOne(newReceipt);
      return newReceipt;
    },
    update: async (
      id: string,
      organizationId: string,
      data: Partial<Receipt>
    ) => {
      const database = await getDb();
      const result = await database
        .collection<Receipt>("receipts")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Receipt>("receipts")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
  deliveries: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const deliveries = await database
        .collection<Delivery>("deliveries")
        .find({ organizationId })
        .toArray();
      return deliveries.map(({ _id, ...delivery }) => ({
        ...delivery,
        id: delivery.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const delivery = await database
        .collection<Delivery>("deliveries")
        .findOne({ id, organizationId });
      if (!delivery) return null;
      const { _id, ...rest } = delivery;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Delivery, "id" | "createdAt">) => {
      const database = await getDb();
      const newDelivery: Delivery = {
        ...data,
        id: `DEL-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database.collection<Delivery>("deliveries").insertOne(newDelivery);
      return newDelivery;
    },
    update: async (
      id: string,
      organizationId: string,
      data: Partial<Delivery>
    ) => {
      const database = await getDb();
      const result = await database
        .collection<Delivery>("deliveries")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Delivery>("deliveries")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
  transfers: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const transfers = await database
        .collection<Transfer>("transfers")
        .find({ organizationId })
        .toArray();
      return transfers.map(({ _id, ...transfer }) => ({
        ...transfer,
        id: transfer.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const transfer = await database
        .collection<Transfer>("transfers")
        .findOne({ id, organizationId });
      if (!transfer) return null;
      const { _id, ...rest } = transfer;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Transfer, "id" | "createdAt">) => {
      const database = await getDb();
      const newTransfer: Transfer = {
        ...data,
        id: `TRN-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database.collection<Transfer>("transfers").insertOne(newTransfer);
      return newTransfer;
    },
    update: async (
      id: string,
      organizationId: string,
      data: Partial<Transfer>
    ) => {
      const database = await getDb();
      const result = await database
        .collection<Transfer>("transfers")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Transfer>("transfers")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
  auditLogs: {
    getAll: async (
      organizationId: string,
      filters?: {
        userId?: string;
        documentType?: string;
        startDate?: string;
        endDate?: string;
      }
    ) => {
      const database = await getDb();
      const query: any = { organizationId };
      if (filters?.userId) query.userId = filters.userId;
      if (filters?.documentType) query.documentType = filters.documentType;
      if (filters?.startDate || filters?.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }
      const logs = await database
        .collection<AuditLog>("auditLogs")
        .find(query)
        .sort({ timestamp: -1 })
        .toArray();
      return logs.map(({ _id, ...log }) => ({
        ...log,
        id: log.id || _id?.toString() || "",
      }));
    },
    create: async (data: Omit<AuditLog, "id">) => {
      const database = await getDb();
      const newLog: AuditLog = {
        ...data,
        id: `audit-${Date.now()}`,
      };
      await database.collection<AuditLog>("auditLogs").insertOne(newLog);
      return newLog;
    },
  },
  warehouses: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const warehouses = await database
        .collection<Warehouse>("warehouses")
        .find({ organizationId })
        .toArray();
      return warehouses.map(({ _id, ...warehouse }) => ({
        ...warehouse,
        id: warehouse.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const warehouse = await database
        .collection<Warehouse>("warehouses")
        .findOne({ id, organizationId });
      if (!warehouse) return null;
      const { _id, ...rest } = warehouse;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Warehouse, "id" | "createdAt">) => {
      const database = await getDb();
      const newWarehouse: Warehouse = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      await database
        .collection<Warehouse>("warehouses")
        .insertOne(newWarehouse);
      return newWarehouse;
    },
    update: async (
      id: string,
      organizationId: string,
      data: Partial<Warehouse>
    ) => {
      const database = await getDb();
      const result = await database
        .collection<Warehouse>("warehouses")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Warehouse>("warehouses")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
  units: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const units = await database
        .collection<Unit>("units")
        .find({ organizationId })
        .toArray();
      return units.map(({ _id, ...unit }) => ({
        ...unit,
        id: unit.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const unit = await database
        .collection<Unit>("units")
        .findOne({ id, organizationId });
      if (!unit) return null;
      const { _id, ...rest } = unit;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Unit, "id" | "createdAt">) => {
      const database = await getDb();
      const newUnit: Unit = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      await database.collection<Unit>("units").insertOne(newUnit);
      return newUnit;
    },
    update: async (id: string, organizationId: string, data: Partial<Unit>) => {
      const database = await getDb();
      const result = await database
        .collection<Unit>("units")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Unit>("units")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
  stockMovements: {
    getAll: async (
      organizationId: string,
      filters?: {
        productId?: string;
        location?: string;
        operation?: string;
        startDate?: string;
        endDate?: string;
      }
    ) => {
      const database = await getDb();
      const query: any = { organizationId };
      if (filters?.productId) query.productId = filters.productId;
      if (filters?.location) query.location = filters.location;
      if (filters?.operation) query.operation = filters.operation;
      if (filters?.startDate || filters?.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = filters.startDate;
        if (filters.endDate) query.date.$lte = filters.endDate;
      }
      const movements = await database
        .collection<StockMovement>("stockMovements")
        .find(query)
        .sort({ date: -1, createdAt: -1 })
        .toArray();
      return movements.map(({ _id, ...movement }) => ({
        ...movement,
        id: movement.id || _id?.toString() || "",
      }));
    },
    create: async (data: Omit<StockMovement, "id" | "createdAt">) => {
      const database = await getDb();
      const newMovement: StockMovement = {
        ...data,
        id: `MOV-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database
        .collection<StockMovement>("stockMovements")
        .insertOne(newMovement);
      return newMovement;
    },
  },
  adjustments: {
    getAll: async (organizationId: string) => {
      const database = await getDb();
      const adjustments = await database
        .collection<Adjustment>("adjustments")
        .find({ organizationId })
        .sort({ date: -1 })
        .toArray();
      return adjustments.map(({ _id, ...adjustment }) => ({
        ...adjustment,
        id: adjustment.id || _id?.toString() || "",
      }));
    },
    getById: async (id: string, organizationId: string) => {
      const database = await getDb();
      const adjustment = await database
        .collection<Adjustment>("adjustments")
        .findOne({ id, organizationId });
      if (!adjustment) return null;
      const { _id, ...rest } = adjustment;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    create: async (data: Omit<Adjustment, "id" | "createdAt">) => {
      const database = await getDb();
      const newAdjustment: Adjustment = {
        ...data,
        id: `ADJ-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      await database
        .collection<Adjustment>("adjustments")
        .insertOne(newAdjustment);
      return newAdjustment;
    },
    update: async (
      id: string,
      organizationId: string,
      data: Partial<Adjustment>
    ) => {
      const database = await getDb();
      const result = await database
        .collection<Adjustment>("adjustments")
        .findOneAndUpdate(
          { id, organizationId },
          { $set: { ...data } },
          { returnDocument: "after" }
        );
      if (!result) return null;
      const { _id, ...rest } = result;
      return { ...rest, id: rest.id || _id?.toString() || "" };
    },
    delete: async (id: string, organizationId: string) => {
      const database = await getDb();
      await database
        .collection<Adjustment>("adjustments")
        .deleteOne({ id, organizationId });
      return true;
    },
  },
};
