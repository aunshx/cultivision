"use client";

import Image from "next/image";
import { getBioreactorById } from "@/lib/bioreactors";
import Title from '@/components/title'

interface FlowDiagramProps {
  bioreactorId: string;
  showTitle?: boolean;
}

const FlowDiagram = ({
  bioreactorId,
  showTitle = true,
}: FlowDiagramProps) => {
  const bioreactor = getBioreactorById(bioreactorId);

  if (!bioreactor) {
    return <div className='text-center p-4'>Bioreactor not found</div>;
  }

  return (
    <div className='w-full border border-gray-200 rounded-lg'>
      {showTitle && (
        <div className='mb-4'>
          <Title title={`Flow Diagram: ${bioreactor.name}`} />
        </div>
      )}
      <div className='relative w-full h-96 lg:h-36'>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${bioreactor.image}`}
          alt={`${bioreactor.name} Flow Diagram`}
          fill
          priority
          className='rounded-lg object-contain'
        />
      </div>
    </div>
  );
}

export default FlowDiagram;