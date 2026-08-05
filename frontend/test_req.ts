import { mockFinancialProfile } from "./src/lib/mockData/profileData";

async function test() {
  const res = await fetch("http://localhost:8000/api/financial-health/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mockFinancialProfile)
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
