/**
 * Admin Hub Categories bulk import
 * POST /admin-hub/categories/import - JSON body: { items: [ { key, label, parentKey, sortOrder } ] }
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AdminHubService from "../../../../services/admin-hub-service"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const adminHubService: AdminHubService = req.scope.resolve("adminHubService")
    const { items } = req.body as { items?: Array<{ key: string; label: string; parentKey: string; sortOrder: number }> }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        message: "items array is required and must not be empty",
      })
      return
    }

    const { imported, categories } = await adminHubService.importCategories(items)

    res.status(201).json({
      imported,
      categories,
    })
  } catch (error) {
    console.error("Admin Hub Categories import error:", error)
    res.status(500).json({
      message: (error as Error)?.message || "Import failed",
    })
  }
}
