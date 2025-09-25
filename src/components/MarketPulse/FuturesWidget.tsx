import MacroDataWidget from "./MacroDataWidget";
import { FUTURES_SYMBOLS } from "../../config/marketPulseConfig";

export default function FuturesWidget() {
  return <MacroDataWidget title="Index Futures" symbols={FUTURES_SYMBOLS} />;
}
