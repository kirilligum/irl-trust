
import { Layout } from '../components/layout/Layout'
// import { Borrow } from '../components/Borrow'
// import { Lend } from '../components/Lend'
import { Head } from '../components/layout/Head'

function Page() {

  return (
    <Layout>
      <Head />
      <div className="flex flex-col">
        <h1>lens</h1>
        <h1>ongoing loans</h1>
        <table>
          <tr>
            <td> name </td>
            <td> status </td>
          </tr>
          <tr>
            <td> sewing maching </td>
            <td> proposal </td>
          </tr>
        </table>
        <h1>history</h1>
        {/* <Borrow /> */}
        {/* <Lend /> */}
        <div className="p-4"></div>
      </div>
    </Layout>
  )
}

export default Page