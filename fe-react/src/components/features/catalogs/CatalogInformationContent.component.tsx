import React from "react"
import { Col, Row } from "antd"
import { CatalogInformationResponse } from "../../../models/dto/CatalogApiResponse.model"
import "./CatalogInformationContent.css"

import CatalogInformationGeneral from "./CatalogInformationGeneral.componenet"
import CatalogInformationBilling from "./CatalogInformationBilling.component"
import CatalogInformationPricing from "./CatalogInformationPricing.component"
import CatalogInformationPosition from "./CatalogInformationPosition.component"
import { FlatThat } from "../../../utils/ArrayFlat.util"
import ShipmentInformationTable from "../tables/ShipmentInformation.component"

type Props = { catalogData?: CatalogInformationResponse; productId: string }
export default function CatalogInformationContent({
  catalogData,
  productId,
}: Props) {
  return (
    <>
      <Row gutter={16} className="row-with-margin m-zoom">
        <Col span={8}>
          <a href={catalogData?.permalink} target="_blank">
            <img src={catalogData?.thumbnail} alt={catalogData?.title} />
          </a>
        </Col>
        <Col span={12}>
          <h2>{catalogData?.title}</h2>
        </Col>
      </Row>
      <Row gutter={16} className="row-with-margin m-zoom">
        <Col span={6}>
          <CatalogInformationGeneral
            catalogData={catalogData}
            productId={productId}
          />
        </Col>
        <Col span={6}>
          <CatalogInformationBilling catalogData={catalogData} />
        </Col>
        <Col span={6}>
          <CatalogInformationPricing catalogData={catalogData} />
        </Col>
        <Col span={6}>
          <CatalogInformationPosition catalogData={catalogData} />
        </Col>
      </Row>

      <Row gutter={16} className="row-with-margin">
        <Col span={14}>
          <h2> Tipos de envio / quantidade</h2>
          <ShipmentInformationTable
            data={FlatThat(catalogData?.shipmentByState)}
          />
        </Col>
      </Row>
    </>
  )
}