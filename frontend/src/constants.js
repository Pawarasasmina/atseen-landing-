export const categories = ['Lifestyle','Fitness','Travel','Food','Music','Fashion','Beauty','Business','Education','Art','Photography','Family','Other'];
export const audiences = ['Under 1,000','1,000–10,000','10,000–50,000','50,000–100,000','100,000+'];
export const statuses = ['new','contacted','reviewing','approved','rejected'];
export const statusLabel = (value) => value ? value[0].toUpperCase() + value.slice(1) : '';
