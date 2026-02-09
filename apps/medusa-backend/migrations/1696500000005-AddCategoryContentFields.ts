import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddCategoryContentFields1696500000005 implements MigrationInterface {
  name = "AddCategoryContentFields1696500000005"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "admin_hub_categories",
      new TableColumn({
        name: "seo_title",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    )
    await queryRunner.addColumn(
      "admin_hub_categories",
      new TableColumn({
        name: "seo_description",
        type: "text",
        isNullable: true,
      })
    )
    await queryRunner.addColumn(
      "admin_hub_categories",
      new TableColumn({
        name: "long_content",
        type: "text",
        isNullable: true,
      })
    )
    await queryRunner.addColumn(
      "admin_hub_categories",
      new TableColumn({
        name: "banner_image_url",
        type: "text",
        isNullable: true,
      })
    )
    console.log("✅ Migration 1696500000005: seo_title, seo_description, long_content, banner_image_url eklendi")
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("admin_hub_categories", "banner_image_url")
    await queryRunner.dropColumn("admin_hub_categories", "long_content")
    await queryRunner.dropColumn("admin_hub_categories", "seo_description")
    await queryRunner.dropColumn("admin_hub_categories", "seo_title")
    console.log("✅ Migration 1696500000005: content kolonları silindi")
  }
}
