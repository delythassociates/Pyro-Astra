'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AskRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] flex items-center justify-center py-20 font-mono text-xs">
      <div className="p-6 bg-[#FAF8F3] border border-[#D5CFC2] space-y-2 text-center">
        <p className="font-bold">Redirecting to Ask ASTRA Workspace...</p>
        <p className="text-[#5A544A]">Home is now the unified AI Intelligence interface.</p>
      </div>
    </div>
  );
}
