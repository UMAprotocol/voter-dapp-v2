
describe("simple.cy", () => {
  it("render in initial state", () => {
    cy.visit("/");
    cy.contains("Connect wallet")
    cy.contains("Stake/Unstake")
  });
  it("opens stake panel",()=>{
    cy.visit("/");
    cy.contains("Stake/Unstake").click()
  })
})
