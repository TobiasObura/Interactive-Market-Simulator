/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceDot, ReferenceLine
} from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

interface ControlSelectProps {
  label: string;
  description: string;
  val: number;
  onUpdate: (id: string, value: number) => void;
  id: string;
  negativeLabel: string;
  positiveLabel: string;
}

export default function App() {
  // State for PASIFIC (Demand) and WET PIGS (Supply) factors
  const [demandFactors, setDemandFactors] = useState({
    P: 0, A: 0, S: 0, I: 0, F: 0, I2: 0, C: 0
  });

  const [supplyFactors, setSupplyFactors] = useState({
    W: 0, E: 0, T: 0, P: 0, I: 0, G: 0, S: 0
  });

  // Calculate total shifts
  const totalDemandShift = useMemo(() => {
    return (
      demandFactors.P + demandFactors.A + demandFactors.S +
      demandFactors.I + demandFactors.F - demandFactors.I2 - demandFactors.C
    );
  }, [demandFactors]);

  const totalSupplyShift = useMemo(() => {
    return (
      supplyFactors.W + supplyFactors.E + supplyFactors.T -
      supplyFactors.P - supplyFactors.I + supplyFactors.G + supplyFactors.S
    );
  }, [supplyFactors]);

  const basePe = 250;
  const baseQe = 6;

  const newPe = Math.max(0, 25 * (10 + totalDemandShift - totalSupplyShift));
  const newQe = Math.max(0, 6 + 0.5 * totalDemandShift + 0.5 * totalSupplyShift);

  // Generate Chart Data
  const chartData = useMemo(() => {
    const data = [];
    for (let q = 0; q <= 15; q += 0.5) {
      let dBase = 550 - 50 * q;
      let sBase = 50 * q - 50;
      let dNew = 550 + 50 * totalDemandShift - 50 * q;
      let sNew = 50 * q - 50 - 50 * totalSupplyShift;

      data.push({
        q,
        BaseDemand: dBase >= 0 ? dBase : null,
        BaseSupply: sBase >= 0 ? sBase : null,
        NewDemand: dNew >= 0 ? dNew : null,
        NewSupply: sNew >= 0 ? sNew : null,
      });
    }
    return data;
  }, [totalDemandShift, totalSupplyShift]);

  const updateDemand = (factor: string, value: number) => {
    setDemandFactors(prev => ({ ...prev, [factor]: value }));
  };

  const updateSupply = (factor: string, value: number) => {
    setSupplyFactors(prev => ({ ...prev, [factor]: value }));
  };

  const resetAll = () => {
    setDemandFactors({ P: 0, A: 0, S: 0, I: 0, F: 0, I2: 0, C: 0 });
    setSupplyFactors({ W: 0, E: 0, T: 0, P: 0, I: 0, G: 0, S: 0 });
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 mb-2">Quantity: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: KES {entry.value.toFixed(0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ControlSelect = ({ label, description, val, onUpdate, id, negativeLabel, positiveLabel }: ControlSelectProps) => (
    <div className="flex flex-col justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="mb-2">
        <span className="font-semibold text-slate-700 block text-sm">{label}</span>
        <span className="text-xs text-slate-500 line-clamp-1" title={description}>{description}</span>
      </div>
      <select
        value={val}
        onChange={(e) => onUpdate(id, parseInt(e.target.value))}
        className={`w-full border text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none transition-colors ${
          val === -1 ? 'bg-red-50 border-red-200 text-red-700' :
          val === 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          'bg-white border-slate-300 text-slate-700'
        }`}
      >
        <option value={-1}>{negativeLabel}</option>
        <option value={0}>Neutral</option>
        <option value={1}>{positiveLabel}</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#003366]">Interactive Market Simulator</h1>
            <p className="text-slate-600 mt-1 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">Year 8 IGCSE</span>
              Topic 2.4: Establishing Price & Quantity - "The Muthurwa Dilemma"
            </p>
          </div>
          <button
            onClick={resetAll}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Market
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Equilibrium Price (Pe)</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-[#003366]">KES {newPe.toFixed(0)}</span>
                {newPe > basePe && <TrendingUp className="w-5 h-5 text-red-500" />}
                {newPe < basePe && <TrendingDown className="w-5 h-5 text-emerald-500" />}
              </div>
              {newPe !== basePe && (
                <p className="text-xs text-slate-500 mt-1">Base was KES {basePe}</p>
              )}
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-sm text-emerald-600 font-semibold mb-1">Equilibrium Quantity (Qe)</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-[#008000]">{newQe.toFixed(1)} units</span>
                {newQe > baseQe && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                {newQe < baseQe && <TrendingDown className="w-5 h-5 text-red-500" />}
              </div>
              {newQe !== baseQe && (
                <p className="text-xs text-slate-500 mt-1">Base was {baseQe} units</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-[500px] lg:h-[600px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#00AEEF]" />
              Market Curves
            </h2>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="q" type="number" domain={[0, 15]} label={{ value: 'Quantity (Units)', position: 'bottom', offset: 0 }} tickCount={16} />
                <YAxis domain={[0, 600]} label={{ value: 'Price (KES)', angle: -90, position: 'insideLeft', offset: 0 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                {(totalDemandShift !== 0) && <Line type="monotone" dataKey="BaseDemand" name="Original Demand" stroke="#fca5a5" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
                {(totalSupplyShift !== 0) && <Line type="monotone" dataKey="BaseSupply" name="Original Supply" stroke="#86efac" strokeWidth={2} strokeDasharray="5 5" dot={false} />}

                <Line type="monotone" dataKey="NewDemand" name={totalDemandShift !== 0 ? "New Demand (Shifted)" : "Demand Curve"} stroke="#ef4444" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="NewSupply" name={totalSupplyShift !== 0 ? "New Supply (Shifted)" : "Supply Curve"} stroke="#10b981" strokeWidth={3} dot={false} />

                {(totalDemandShift !== 0 || totalSupplyShift !== 0) && <ReferenceDot x={baseQe} y={basePe} r={4} fill="#94a3b8" stroke="none" />}

                <ReferenceDot x={newQe} y={newPe} r={6} fill="#003366" stroke="#fff" strokeWidth={2} />
                <ReferenceLine x={newQe} stroke="#003366" strokeDasharray="3 3" segment={[{ x: newQe, y: 0 }, { x: newQe, y: newPe }]} />
                <ReferenceLine y={newPe} stroke="#003366" strokeDasharray="3 3" segment={[{ x: 0, y: newPe }, { x: newQe, y: newPe }]} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#003366] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center text-[#00AEEF]">
              <Info className="w-5 h-5 mr-2" />
              Economic Analysis (The "Invisible Hand" at Work)
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              {totalDemandShift === 0 && totalSupplyShift === 0 ? (
                "The market is perfectly cleared at KES 250. Buyers willing to pay KES 250 or more get the good, and sellers willing to sell for KES 250 or less make a trade. No shortages, no surpluses."
              ) : (
                <span>
                  The market has experienced a shock!
                  {totalDemandShift > 0 && " Increased demand puts upward pressure on prices. "}
                  {totalDemandShift < 0 && " Decreased demand forces sellers to drop prices. "}
                  {totalSupplyShift > 0 && " Increased supply gluts the market, driving prices down. "}
                  {totalSupplyShift < 0 && " Reduced supply creates scarcity, pushing prices up. "}
                  The price mechanism automatically adjusts to the new equilibrium at <strong>KES {newPe.toFixed(0)}</strong> to clear the market.
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
              <h2 className="text-lg font-bold text-red-600 mb-4">Demand Shifters (PASIFIC)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <ControlSelect label="P - Population" description="Size of the target market" id="P" val={demandFactors.P} onUpdate={updateDemand} negativeLabel="Decrease" positiveLabel="Increase" />
                <ControlSelect label="A - Advertising" description="Marketing campaign results" id="A" val={demandFactors.A} onUpdate={updateDemand} negativeLabel="Failure" positiveLabel="Success" />
                <ControlSelect label="S - Substitutes" description="Price of competing goods" id="S" val={demandFactors.S} onUpdate={updateDemand} negativeLabel="Fall" positiveLabel="Rise" />
                <ControlSelect label="I - Incomes" description="Consumer spending power" id="I" val={demandFactors.I} onUpdate={updateDemand} negativeLabel="Fall" positiveLabel="Rise" />
                <ControlSelect label="F - Fashion/Tastes" description="Current trends" id="F" val={demandFactors.F} onUpdate={updateDemand} negativeLabel="Outdated" positiveLabel="Trending" />
                <ControlSelect label="I - Interest Rates" description="Cost of borrowing money" id="I2" val={demandFactors.I2} onUpdate={updateDemand} negativeLabel="Fall" positiveLabel="Rise" />
                <ControlSelect label="C - Complements" description="Price of goods used together" id="C" val={demandFactors.C} onUpdate={updateDemand} negativeLabel="Fall" positiveLabel="Rise" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-600 mb-4">Supply Shifters (WET PIGS)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <ControlSelect label="W - Weather" description="Natural conditions/disasters" id="W" val={supplyFactors.W} onUpdate={updateSupply} negativeLabel="Bad" positiveLabel="Good" />
                <ControlSelect label="E - Expectations" description="Expectation of future prices" id="E" val={supplyFactors.E} onUpdate={updateSupply} negativeLabel="Will Rise" positiveLabel="Will Fall" />
                <ControlSelect label="T - Technology" description="Production methods" id="T" val={supplyFactors.T} onUpdate={updateSupply} negativeLabel="Breaks" positiveLabel="Improves" />
                <ControlSelect label="P - Prices of Inputs" description="Cost of raw materials" id="P" val={supplyFactors.P} onUpdate={updateSupply} negativeLabel="Fall" positiveLabel="Rise" />
                <ControlSelect label="I - Indirect Taxes" description="Government taxation on goods" id="I" val={supplyFactors.I} onUpdate={updateSupply} negativeLabel="Removed" positiveLabel="Imposed" />
                <ControlSelect label="G - Government Rules" description="Regulations and red tape" id="G" val={supplyFactors.G} onUpdate={updateSupply} negativeLabel="Strict" positiveLabel="Relaxed" />
                <ControlSelect label="S - Subsidies" description="Government financial support" id="S" val={supplyFactors.S} onUpdate={updateSupply} negativeLabel="Removed" positiveLabel="Granted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
