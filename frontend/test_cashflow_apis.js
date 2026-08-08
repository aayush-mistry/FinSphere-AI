async function testApis() {
  const baseUrl = 'http://localhost:3000/api/cashflow';
  const startDate = '2026-08-01';
  const endDate = '2026-08-31';

  console.log('--- TESTING CASH FLOW APIs ---\n');

  try {
    // 1. Reconciliation
    console.log('1. GET /api/cashflow/reconciliation');
    const recRes = await fetch(`${baseUrl}/reconciliation?start_date=${startDate}&end_date=${endDate}`);
    const rec = await recRes.json();
    console.log(JSON.stringify(rec, null, 2), '\n');

    // 2. Allocation
    console.log('2. GET /api/cashflow/allocation');
    const allocRes = await fetch(`${baseUrl}/allocation?start_date=${startDate}&end_date=${endDate}`);
    const alloc = await allocRes.json();
    console.log(JSON.stringify(alloc, null, 2), '\n');

    // 3. Comparison
    console.log('3. GET /api/cashflow/comparison');
    const compRes = await fetch(`${baseUrl}/comparison?start_date=2026-05-01&end_date=2026-08-31`);
    const comp = await compRes.json();
    console.log(JSON.stringify(comp, null, 2), '\n');

    // 4. Insights
    console.log('4. GET /api/cashflow/insights');
    const insightsRes = await fetch(`${baseUrl}/insights?start_date=${startDate}&end_date=${endDate}`);
    const insights = await insightsRes.json();
    console.log(JSON.stringify(insights, null, 2), '\n');

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

testApis();
