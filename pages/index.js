import Layout from '../components/layout'
import CallToActionWithAnnotation from '../components/landing/CallToActionWithAnnotation'

// Landing page
function Index() {
  return (
    <>
      <CallToActionWithAnnotation />
    </>
  )
}

Index.getLayout = function getLayout(page) {
  return (
    <>
      {page}
    </>
  )
}

export default Index
