import { motion, useReducedMotion } from 'framer-motion';
export default function Reveal({ children, className = '' }) { const reduce = useReducedMotion(); return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={reduce ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .6 }}>{children}</motion.div>; }
