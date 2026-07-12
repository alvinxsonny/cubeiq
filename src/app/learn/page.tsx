'use client';

import React from 'react';
import { motion } from 'framer-motion';
import LearnSection from '@/components/LearnSection';

export default function LearnPage() {
  return (
    <main className="flex-1 max-w-7xl mx-auto px-6 pt-4 pb-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full"
      >
        <LearnSection />
      </motion.div>
    </main>
  );
}
