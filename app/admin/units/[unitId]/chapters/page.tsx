'use client';

import { useParams } from 'next/navigation';
import { ChapterList } from '@/app/admin/chapter/list';

export default function UnitChaptersPage() {
  const params = useParams();
  const unitId = params.unitId;

  return (
    <div>
      <h1>Chapters for Unit {unitId}</h1>
      <ChapterList unitId={Number(unitId)} />
    </div>
  );
} 