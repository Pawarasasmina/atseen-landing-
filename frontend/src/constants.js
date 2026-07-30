export const categories = ['Fitness', 'Beauty', 'Fashion', 'AI', 'Business', 'Trading', 'Content', 'Gaming', 'Travel', 'Music', 'Lifestyle', 'Food', 'Education', 'Art', 'Photography', 'Family', 'Other'];
export const audiences = ['Under 5K', '5-20K', '20-100K', '100K+', '500K+', '1M+', '5M+'];
export const statuses = ['new', 'reviewing', 'shortlisted', 'waitlisted', 'invited', 'rejected'];
export const statusLabel = (value) => value ? value[0].toUpperCase() + value.slice(1) : '';
