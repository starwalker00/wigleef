import Layout from '../components/layout'
import CallToActionWithAnnotation from '../components/landing/CallToActionWithAnnotation'

function Index() {
  return (
    <>
      <CallToActionWithAnnotation />
    </>
  )
}

Index.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default Index
