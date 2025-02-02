import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1738332576931 implements MigrationInterface {
    name = 'Init1738332576931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`brand_model\` (\`id\` int NOT NULL AUTO_INCREMENT, \`brand\` varchar(255) NULL, \`model\` varchar(255) NULL, \`color\` varchar(255) NULL, \`modelDetailed\` varchar(255) NULL, UNIQUE INDEX \`IDX_4c72a0c77476ef06e61439d0d0\` (\`brand\`, \`model\`, \`color\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`catalog_fields\` (\`priceBest\` float NULL, \`priceSecond\` float NULL, \`priceTop5Avg\` float NULL, \`priceFull\` float NULL, \`positionFull\` int NULL, \`positionMedalGold\` int NULL, \`positionMedalPlatinum\` int NULL, \`positionMedalLider\` int NULL, \`positionOfficialStore\` int NULL, \`length\` int NULL, \`mlOwner\` tinyint NULL, \`id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`totalItems\` int NULL, \`permaLink\` varchar(255) NULL, \`hasItems\` tinyint NULL, \`hasChildren\` tinyint NULL, \`parentId\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`job_groups\` (\`id\` varchar(36) NOT NULL, \`description\` varchar(128) NOT NULL, \`status\` int NOT NULL DEFAULT '0', \`metadataUpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`jobs\` (\`id\` varchar(36) NOT NULL, \`jobStatus\` tinyint NOT NULL DEFAULT '0', \`jobPriority\` tinyint NOT NULL DEFAULT '1', \`ttl\` tinyint NOT NULL DEFAULT '5', \`metadataUpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`metadataCreateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`jobGroupsId\` varchar(36) NULL, \`productId\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`search\` (\`id\` int NOT NULL AUTO_INCREMENT, \`searchTerm\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`categoryId\` varchar(255) NULL, \`metadataUpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fc1b1b71ce4e8ae7653bcec0ce\` (\`searchTerm\`, \`url\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`search_position\` (\`id\` int NOT NULL AUTO_INCREMENT, \`position\` int NOT NULL, \`metadataUpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`searchId\` int NULL, \`productId\` varchar(255) NULL, UNIQUE INDEX \`IDX_c683fb3bff2f6961728d12c8d0\` (\`searchId\`, \`position\`, \`productId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seller\` (\`id\` int NOT NULL, \`nickname\` varchar(255) NULL, \`sellerAddressStateId\` varchar(5) NULL, \`userType\` varchar(32) NULL, \`permalink\` varchar(255) NULL, \`sellerReputationLevelId\` varchar(20) NULL, \`sellerReputationPowerSellerStatus\` varchar(20) NULL, \`sellerReputationTransactionsTotal\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`state_fields\` (\`state\` varchar(5) NOT NULL, \`type\` varchar(255) NOT NULL, \`subType\` varchar(24) NOT NULL, \`value\` float NOT NULL, \`productCatalog\` varchar(255) NOT NULL, \`productCatalogId\` varchar(255) NULL, INDEX \`IDX_CUSTOM_INDEX\` (\`state\`, \`subType\`, \`productCatalog\`), PRIMARY KEY (\`state\`, \`type\`, \`subType\`, \`productCatalog\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products_catalogs\` (\`id\` varchar(255) NOT NULL, \`type\` tinyint NOT NULL, \`title\` varchar(255) NULL, \`domainId\` varchar(255) NULL, \`officialStoreId\` varchar(16) NULL, \`price\` float NULL, \`basePrice\` float NULL, \`originalPrice\` float NULL, \`listingTypeId\` varchar(32) NULL, \`permalink\` varchar(255) NULL, \`videoId\` varchar(255) NULL, \`ean\` varchar(255) NULL, \`thumbnail\` varchar(255) NULL, \`pictureCount\` int NULL, \`health\` int NULL, \`shippingFreeShipping\` tinyint NULL, \`shippingLogisticType\` varchar(20) NULL, \`catalogProductId\` varchar(15) NULL, \`catalogListing\` tinyint NULL, \`dateCreated\` varchar(27) NULL, \`tagsGoodQualityThumbnail\` tinyint NULL, \`tagsGoodQualityPicture\` tinyint NULL, \`hasPromotion\` tinyint NULL, \`hasVideo\` tinyint NULL, \`supermarketEligible\` tinyint NULL, \`isKit\` tinyint NULL, \`revenue\` int NULL, \`quantitySold\` int NULL, \`currentPrice\` float NULL, \`dailyRevenue\` float NULL, \`metadataUpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`categoryId\` varchar(255) NULL, \`sellerId\` int NULL, \`brandModelId\` int NULL, \`viewsId\` varchar(255) NULL, \`catalogFieldsId\` varchar(255) NULL, INDEX \`IDX_CUSTOM_INDEX\` (\`id\`, \`type\`), UNIQUE INDEX \`REL_883f2dc057065337c5015ec0dd\` (\`viewsId\`), UNIQUE INDEX \`REL_ad397aff26722d34d48d22ba12\` (\`catalogFieldsId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_views_summary\` (\`startDate\` varchar(255) NOT NULL, \`endDate\` varchar(255) NOT NULL, \`dailyAvg\` float NOT NULL, \`totalVisits\` int NOT NULL, \`cv\` float NULL, \`id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`search_summary_fields\` (\`id\` int NOT NULL AUTO_INCREMENT, \`searchType\` varchar(255) NOT NULL, \`valueNum\` float NULL, \`valueStr\` varchar(255) NULL, \`searchId\` int NULL, PRIMARY KEY (\`id\`, \`searchType\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`jobs\` ADD CONSTRAINT \`FK_9fd3889f63c84b9328b30caeb52\` FOREIGN KEY (\`jobGroupsId\`) REFERENCES \`job_groups\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`jobs\` ADD CONSTRAINT \`FK_491a5f4377a32a3738d84925efe\` FOREIGN KEY (\`productId\`) REFERENCES \`products_catalogs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`search_position\` ADD CONSTRAINT \`FK_a385ed40135a8158eb8dfa2c9f8\` FOREIGN KEY (\`searchId\`) REFERENCES \`search\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`search_position\` ADD CONSTRAINT \`FK_c42dba2b59ca7c73d645a173a85\` FOREIGN KEY (\`productId\`) REFERENCES \`products_catalogs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`state_fields\` ADD CONSTRAINT \`FK_6bcc4d2c03bd1b4d48a8d69c941\` FOREIGN KEY (\`productCatalogId\`) REFERENCES \`products_catalogs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` ADD CONSTRAINT \`FK_ef64ed7bff4e433e0ce017e2f9d\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` ADD CONSTRAINT \`FK_0a175881ef7af4c395ec01a3b66\` FOREIGN KEY (\`sellerId\`) REFERENCES \`seller\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` ADD CONSTRAINT \`FK_655e22d0d5affab592a422f92b2\` FOREIGN KEY (\`brandModelId\`) REFERENCES \`brand_model\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` ADD CONSTRAINT \`FK_883f2dc057065337c5015ec0dde\` FOREIGN KEY (\`viewsId\`) REFERENCES \`product_views_summary\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` ADD CONSTRAINT \`FK_ad397aff26722d34d48d22ba127\` FOREIGN KEY (\`catalogFieldsId\`) REFERENCES \`catalog_fields\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`search_summary_fields\` ADD CONSTRAINT \`FK_0fdff839347e846a423a9a20b3d\` FOREIGN KEY (\`searchId\`) REFERENCES \`search\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`search_summary_fields\` DROP FOREIGN KEY \`FK_0fdff839347e846a423a9a20b3d\``);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` DROP FOREIGN KEY \`FK_ad397aff26722d34d48d22ba127\``);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` DROP FOREIGN KEY \`FK_883f2dc057065337c5015ec0dde\``);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` DROP FOREIGN KEY \`FK_655e22d0d5affab592a422f92b2\``);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` DROP FOREIGN KEY \`FK_0a175881ef7af4c395ec01a3b66\``);
        await queryRunner.query(`ALTER TABLE \`products_catalogs\` DROP FOREIGN KEY \`FK_ef64ed7bff4e433e0ce017e2f9d\``);
        await queryRunner.query(`ALTER TABLE \`state_fields\` DROP FOREIGN KEY \`FK_6bcc4d2c03bd1b4d48a8d69c941\``);
        await queryRunner.query(`ALTER TABLE \`search_position\` DROP FOREIGN KEY \`FK_c42dba2b59ca7c73d645a173a85\``);
        await queryRunner.query(`ALTER TABLE \`search_position\` DROP FOREIGN KEY \`FK_a385ed40135a8158eb8dfa2c9f8\``);
        await queryRunner.query(`ALTER TABLE \`jobs\` DROP FOREIGN KEY \`FK_491a5f4377a32a3738d84925efe\``);
        await queryRunner.query(`ALTER TABLE \`jobs\` DROP FOREIGN KEY \`FK_9fd3889f63c84b9328b30caeb52\``);
        await queryRunner.query(`DROP TABLE \`search_summary_fields\``);
        await queryRunner.query(`DROP TABLE \`product_views_summary\``);
        await queryRunner.query(`DROP INDEX \`REL_ad397aff26722d34d48d22ba12\` ON \`products_catalogs\``);
        await queryRunner.query(`DROP INDEX \`REL_883f2dc057065337c5015ec0dd\` ON \`products_catalogs\``);
        await queryRunner.query(`DROP INDEX \`IDX_CUSTOM_INDEX\` ON \`products_catalogs\``);
        await queryRunner.query(`DROP TABLE \`products_catalogs\``);
        await queryRunner.query(`DROP INDEX \`IDX_CUSTOM_INDEX\` ON \`state_fields\``);
        await queryRunner.query(`DROP TABLE \`state_fields\``);
        await queryRunner.query(`DROP TABLE \`seller\``);
        await queryRunner.query(`DROP INDEX \`IDX_c683fb3bff2f6961728d12c8d0\` ON \`search_position\``);
        await queryRunner.query(`DROP TABLE \`search_position\``);
        await queryRunner.query(`DROP INDEX \`IDX_fc1b1b71ce4e8ae7653bcec0ce\` ON \`search\``);
        await queryRunner.query(`DROP TABLE \`search\``);
        await queryRunner.query(`DROP TABLE \`jobs\``);
        await queryRunner.query(`DROP TABLE \`job_groups\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`catalog_fields\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c72a0c77476ef06e61439d0d0\` ON \`brand_model\``);
        await queryRunner.query(`DROP TABLE \`brand_model\``);
    }

}
