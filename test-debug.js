const { sql, eq, and } = require('drizzle-orm');

// Mock column object
const mockColumn = { name: 'type' };
const mockMetadataColumn = { name: 'metadata' };

// Test eq()
const eqCondition = eq(mockColumn, 'onboarding_answer');
console.log('eq condition:', JSON.stringify(eqCondition, null, 2));

// Test sql``
const questionKey = 'q1';
const sqlCondition = sql`json_extract(${mockMetadataColumn}, '$.questionKey') = ${questionKey}`;
console.log('sql condition:', JSON.stringify(sqlCondition, null, 2));

// Test and()
const andCondition = and(eqCondition, sqlCondition);
console.log('and condition:', JSON.stringify(andCondition, null, 2));

// Look at the structure
console.log('\n=== Structure inspection ===');
console.log('and.value:', andCondition.value);
if (andCondition.value && Array.isArray(andCondition.value)) {
  andCondition.value.forEach((cond, i) => {
    console.log(`\nCondition ${i}:`, cond);
    console.log(`  queryChunks:`, cond.queryChunks);
    if (cond.value) {
      console.log(`  value:`, cond.value);
      console.log(`  value.value:`, cond.value.value);
    }
  });
}
