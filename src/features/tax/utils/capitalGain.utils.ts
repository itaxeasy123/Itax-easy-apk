export const calculateCapitalGainTax = (
  stcg: number,
  ltcg: number
) => {
  const stcgTax = stcg * 0.15; // 15%
  const ltcgTax =
    ltcg > 100000 ? (ltcg - 100000) * 0.1 : 0;

  return {
    stcgTax,
    ltcgTax,
    total: stcgTax + ltcgTax,
  };
};
