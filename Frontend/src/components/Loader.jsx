import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <motion.div
        className="h-16 w-16 rounded-full border-4 border-white/10 border-t-cyan-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
