"use client";

import BioreactorChart from "@/components/bioreactor/charts/cost-distribution";
import LaborCostAnnualGraph from "@/components/bioreactor/charts/labor-cost-annual";
import LaborCostHourlyGraph from "@/components/bioreactor/charts/labor-cost-hourly";
import FlowDiagram from "@/components/bioreactor/flow-diagram";
import ParameterForm from "@/components/bioreactor/form";
import ImageModal from "@/components/bioreactor/image-modal";
import ExpenseTable from "@/components/bioreactor/tables/cost-breakdown";
import LaborCostTable from "@/components/bioreactor/tables/labor-cost";
import MetricsTable from "@/components/bioreactor/tables/summary";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Toast from "@/components/toast";
import { useCalculations } from "@/context/calculation-context";
import { useModal } from "@/context/modal-context";
import { usePageViewTracking } from "@/hooks/use-page-view-tracking";
import { useEffect, useState } from "react";
import Loading from "./loading";

const URL_COPIED_EVENT = "urlCopied";

const Home = () => {
  const { activeReactorId, expenses, isUrlParamProcessed } = useCalculations();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success"
  );

  usePageViewTracking();

  useEffect(() => {
    const handleUrlCopied = () => {
      setToastMessage("Input URL copied to clipboard!");
      setToastType("success");
      setShowToast(true);
    };

    window.addEventListener(URL_COPIED_EVENT, handleUrlCopied);

    return () => {
      window.removeEventListener(URL_COPIED_EVENT, handleUrlCopied);
    };
  }, []);

  useEffect(() => {
    if (
      isUrlParamProcessed &&
      new URLSearchParams(window.location.search).has("p")
    ) {
      setToastMessage("Dashboard loaded with saved inputs!");
      setToastType("info");
      setShowToast(true);
    }
  }, [isUrlParamProcessed]);

  if (!expenses) {
    return <Loading />;
  }

  return (
    <main className='min-h-screen'>
      <div
        className='flex flex-col lg:flex-row h-full pt-18 gap-2'
      >
        <div
          className='w-full lg:w-1/4 pt-6 px-0 lg:p lg:pb-24 lg:h-full lg:overflow-y-auto lg:fixed lg:left-4 lg:top-16 flex flex-col md:items-center md:justify-start gap-6 mr-2'
          aria-label='Input Form and Bioreactor View'
        >
          <div className='bg-white rounded-lg shadow-md p-4 border border-solid border-gray-100 lg:w-full'>
            <ParameterForm />
          </div>
          <div
            className='bg-white rounded-lg shadow-md p-4 border border-solid border-gray-100 flex flex-col gap-y-2 cursor-pointer w-full'
            onClick={openModal}
          >
            <h3 className='text-lg font-semibold text-gray-700 text-center'>
              Bioreactor View
            </h3>
            <div className='hover:opacity-90 transition-opacity'>
              <FlowDiagram bioreactorId={activeReactorId} showTitle={false} />
            </div>

            <div className='text-center text-sm text-green-600 hover:text-blue-500'>
              Click to enlarge
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-md p-4 border border-solid border-gray-100 hidden lg:block lg:w-full'>
            <Footer />
          </div>
        </div>

        <div className='w-full lg:w-3/4 lg:ml-[26%] pt-5 px-0 lg:p-4 overflow-y-auto'>
          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {/* <Container>
                <BioreactorBarChart expenses={expenses} />
              </Container> */}
              <Container>
                <BioreactorChart expenses={expenses} />
              </Container>
              <Container>
                <ExpenseTable expenses={expenses} />
              </Container>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              <Container className='h-full'>
                <MetricsTable expenses={expenses} />
              </Container>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <Container>
                <LaborCostHourlyGraph />
              </Container>
              <Container>
                <LaborCostAnnualGraph />
              </Container>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              <Container>
                <LaborCostTable />
              </Container>
            </div>
          </div>
        </div>
        <div className='mb-8 lg:mb-0 lg:hidden w-full flex justify-center items-center'>
          <div className='bg-white rounded-lg shadow-md p-4 border border-solid border-gray-100 w-96'>
            <Footer />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ImageModal bioreactorId={activeReactorId} onClose={closeModal} />
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </main>
  );
};

export default Home;
