import CallToActionWithAnnotation from '../components/landing/CallToActionWithAnnotation'
import TopBar from '../components/landing/TopBar'
import ListTechnologies from '../components/landing/ListTechnologies'
import {
  Container,
} from '@chakra-ui/react';
import Head from 'next/head';

// Landing page
function Index() {
  return (
    <>
      <Head></Head>
      <Container maxW={'7xl'}>
        <TopBar />
        <CallToActionWithAnnotation />
        <ListTechnologies />
      </Container>
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
