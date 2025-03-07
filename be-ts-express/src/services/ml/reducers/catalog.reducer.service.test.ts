// import { LogisticType } from "../../../models/api-response/ml/product-response.models"
// import { MLProduct } from "../../../models/dto/ml-product.models"
// import { PowerSellerStatus } from "../../../models/dto/ml-user.models"
// import { catalogReducer } from "./catalog.reducer.service"

// describe("catalogReducer", () => {
//   it("Should correctly reduce the catalog multiple item array", () => {
//     //Arrange
//     const commonProperties = {
//       title: "product name",
//       id: "id",
//       permalink: "https://example.com",
//       category_id: "CATEGORY_ID",
//       attributes: [
//         {
//           id: "GTIN",
//           name: "Código universal de produto",
//           value_id: null,
//           value_name: "6015615941994",
//           values: [
//             {
//               id: null,
//               name: "6015615941994",
//               struct: null,
//             },
//           ],
//           value_type: "string",
//         },
//         {
//           id: "IS_DERMATOLOGIST_TESTED",
//           name: "É testado dermatologicamente",
//           value_id: "242085",
//           value_name: "Sim",
//           values: [
//             {
//               id: "242085",
//               name: "Sim",
//               struct: null,
//             },
//           ],
//           value_type: "boolean",
//         },
//       ],
//     }
//     const sellers: Array<MLProduct> = [
//       {
//         ...commonProperties,
//         domain_id: "123",
//         seller_address: { state: { id: "BR-SP" } },
//         date_created: "2022-06-13T11:23:59.000Z",
//         permalink: "https://example.com",
//         price: 50,
//         owner: false,
//         tags: ["good_quality_thumbnail", "supermarket_eligible"],
//         shipping: {
//           logistic_type: LogisticType.correios,
//         },
//         user: {
//           id: 1,
//           seller_reputation: {
//             power_seller_status: PowerSellerStatus.Platinum,
//           },
//         },
//       },
//       {
//         ...commonProperties,
//         seller_address: { state: { id: "BR-SP" } },
//         date_created: "2022-06-13T11:23:59.000Z",
//         price: 55,
//         owner: false,
//         official_store_id: 123,
//         shipping: {
//           logistic_type: LogisticType.coleta,
//         },
//         user: {
//           id: 1,
//           seller_reputation: { power_seller_status: PowerSellerStatus.Gold },
//         },
//       },
//       {
//         ...commonProperties,
//         seller_address: { state: { id: "BR-SC" } },
//         date_created: "2022-06-13T11:23:59.000Z",
//         price: 60,
//         owner: false,
//         shipping: {
//           logistic_type: LogisticType.full,
//         },
//         user: {
//           id: 1,
//           seller_reputation: { power_seller_status: PowerSellerStatus.Gold },
//         },
//       },
//       {
//         ...commonProperties,
//         seller_address: { state: { id: "BR-SP" } },
//         date_created: "2022-06-13T11:23:59.000Z",
//         price: 60,
//         owner: false,
//         shipping: {
//           logistic_type: LogisticType.full,
//         },
//         user: {
//           id: 1,
//           seller_reputation: null,
//         },
//       },
//     ]

//     //Act
//     const result = catalogReducer(sellers)

//     //Assert
//     expect(result).toEqual({
//       title: "product name",
//       ean: "6015615941994",
//       domainId: "123",
//       tagsGoodQualityThumbnail: true,
//       price: { top5Avg: 56.25, best: 50, secondBest: 55, full: 60 },
//       permalink: "https://example.com",
//       supermarketEligible: true,
//       categoryId: "CATEGORY_ID",
//       position: {
//         full: 3,
//         medalGold: 2,
//         medalPlatinum: 1,
//         medalLider: null,
//         officialStore: 2,
//       },
//       brandModel: {
//         brand: null,
//         model: null,
//         color: null,
//       },
//       length: 4,
//       mlOwner: false,
//       dateCreated: "2022-06-13T11:23:59.000Z",
//       shipmentByState: {
//         full: { "BR-SC": 1, "BR-SP": 1 },
//         correios: { "BR-SP": 1 },
//         coleta: { "BR-SP": 1 },
//         others: {},
//       },
//       medalByState: {
//         medalLider: {},
//         medalGold: { "BR-SP": 1, "BR-SC": 1 },
//         medalPlatinum: { "BR-SP": 1 },
//         noMedal: { "BR-SP": 1 },
//       },
//       state: {
//         "BR-SC": 1,
//         "BR-SP": 3,
//       },
//     })
//   })

//   it("Should correctly reduce the one element catalog array", () => {
//     //Arrange
//     const commonProperties = {
//       title: "product name",
//       id: "id",
//       permalink: "https://example.com",
//       thumbnail: "https://example",
//       category_id: "MLB198494",
//     }
//     const sellers: Array<MLProduct> = [
//       {
//         ...commonProperties,
//         seller_address: { state: { id: "BR-SP" } },
//         date_created: "2022-06-13T11:23:59.000Z",
//         price: 50,
//         tags: [],
//         owner: false,
//         shipping: {
//           logistic_type: LogisticType.correios,
//         },
//         user: {
//           id: 1,
//           seller_reputation: {
//             power_seller_status: PowerSellerStatus.Platinum,
//           },
//         },
//       },
//     ]

//     //Act
//     const result = catalogReducer(sellers)

//     //Assert
//     expect(result).toEqual({
//       title: "product name",
//       ean: null,
//       domainId: null,
//       tagsGoodQualityThumbnail: false,
//       price: { top5Avg: 50, best: 50, secondBest: null, full: null },
//       permalink: "https://example.com",
//       thumbnail: "https://example",
//       supermarketEligible: false,
//       categoryId: "MLB198494",
//       position: {
//         full: null,
//         medalGold: null,
//         medalPlatinum: 1,
//         medalLider: null,
//         officialStore: null,
//       },
//       brandModel: {
//         brand: null,
//         model: null,
//         color: null,
//       },
//       length: 1,
//       mlOwner: false,
//       dateCreated: "2022-06-13T11:23:59.000Z",
//       shipmentByState: {
//         full: {},
//         correios: { "BR-SP": 1 },
//         coleta: {},
//         others: {},
//       },
//       medalByState: {
//         medalLider: {},
//         medalGold: {},
//         medalPlatinum: { "BR-SP": 1 },
//         noMedal: {},
//       },
//       state: {
//         "BR-SP": 1,
//       },
//     })
//   })
// })
