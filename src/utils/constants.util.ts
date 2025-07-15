import numeral from "numeral";

export const formatInky = (amount: string, currency = "₦") => {
  let textResult = currency;

  try {
    if (isNaN(parseFloat(amount))) {
      textResult += numeral(parseFloat(amount.replace(",", ""))).format(
        "0,0.00"
      );
    } else {
      textResult += numeral(parseFloat(amount)).format("0,0.00");
    }
  } catch (e) {}
  return textResult;
};

export const PORT = process.env.PORT || 9871;


export const THOUSAND = 1000
export const TWO = 2
export const ZERO = 0