import React from "react"
import { LoadingOutlined } from "@ant-design/icons"
import useFetchCatalogInformation from "../../hooks/useFetchCatalogInformation"
import SearchCatalogComponent from "../../components/common/Search.component"
import { extractProductId } from "../../utils/Regex.util"
import { useNavigate, useParams } from "react-router-dom"
import CatalogInformationContent from "../../components/features/catalogs/CatalogInformationContent.component"
import "./CatalogInformation.scss"
const CatalogInformationPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const searchTerm = id ?? ""

  const onSearchHandler = (searchTerm: string) => {
    const productId = extractProductId(searchTerm)
    navigate(`/catalog/${productId}`)
  }
  const { isLoading, isFetched, isError, data, error, refetch } =
    useFetchCatalogInformation(searchTerm)

  React.useEffect(() => {
    refetch()
  }, [searchTerm])

  return (
    <div>
      <SearchCatalogComponent
        onSearchHandler={onSearchHandler}
        isLoading={isLoading}
      />
      {isError && <p>Error fetching data</p>}
      {isLoading && searchTerm && <LoadingOutlined className="page-loading" />}
      {isFetched && searchTerm && (
        <CatalogInformationContent catalogData={data} productId={searchTerm} />
      )}
    </div>
  )
}

export default CatalogInformationPage
