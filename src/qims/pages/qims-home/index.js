import PageLayout from "qims/layouts/LayoutContainers/PageLayout";
import DefaultHeader from "qims/components/headers/DefaultHeader";
import DefaultBody from "qims/components/body/DefaultBody";
import DefaultFooter from "qims/components/footers/DefaultFooter";

function QimsHomePage() {
  return (
    <PageLayout>
      <DefaultHeader />
      <DefaultBody />
      <DefaultFooter />
    </PageLayout>
  );
}

export default QimsHomePage;
