"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Calculator, TrendingUp, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Instrument {
  name: string
  dollarCostPerUnit: number
  unitToVolumeConversion: number
  standardLotSize: number
}

const DEFAULT_INSTRUMENTS: Instrument[] = [
  { name: "SPX500", dollarCostPerUnit: 1.01, unitToVolumeConversion: 0.1, standardLotSize: 0.5 },
  { name: "NAS100", dollarCostPerUnit: 0.25, unitToVolumeConversion: 0.1, standardLotSize: 0.5 },
  { name: "EURUSD", dollarCostPerUnit: 1.0, unitToVolumeConversion: 0.01, standardLotSize: 0.01 },
  { name: "GBPUSD", dollarCostPerUnit: 1.0, unitToVolumeConversion: 0.01, standardLotSize: 0.01 },
]

export default function TradingCalculator() {
  const [tradingCapital, setTradingCapital] = useState<string>("5000")
  const [riskPercentage, setRiskPercentage] = useState<string>("1")
  const [selectedInstrument, setSelectedInstrument] = useState<string>("SPX500")
  const [dollarCostPerUnit, setDollarCostPerUnit] = useState<string>("1.01")
  const [stopLossPoints, setStopLossPoints] = useState<string>("12")
  const [unitToVolumeConversion, setUnitToVolumeConversion] = useState<string>("0.1")
  const [standardLotSize, setStandardLotSize] = useState<string>("0.5")
  const [customInstruments, setCustomInstruments] = useState<Instrument[]>([])
  const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null)
  const [calculationBreakdown, setCalculationBreakdown] = useState<{
    maxDollarRisk: number
    riskPerUnit: number
    rawTradeVolume: number
    finalVolume: number
  } | null>(null)

  const [newInstrumentName, setNewInstrumentName] = useState<string>("")
  const [newDollarCost, setNewDollarCost] = useState<string>("")
  const [newUnitConversion, setNewUnitConversion] = useState<string>("")
  const [newLotSize, setNewLotSize] = useState<string>("")

  useEffect(() => {
    const stored = localStorage.getItem("customInstruments")
    if (stored) {
      try {
        setCustomInstruments(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading custom instruments:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("customInstruments", JSON.stringify(customInstruments))
  }, [customInstruments])

  const allInstruments = [...DEFAULT_INSTRUMENTS, ...customInstruments]

  const handleInstrumentChange = (instrumentName: string) => {
    setSelectedInstrument(instrumentName)
    const instrument = allInstruments.find((i) => i.name === instrumentName)
    if (instrument) {
      setDollarCostPerUnit(instrument.dollarCostPerUnit.toString())
      setUnitToVolumeConversion(instrument.unitToVolumeConversion.toString())
      setStandardLotSize(instrument.standardLotSize.toString())
    }
  }

  useEffect(() => {
    const capital = Number.parseFloat(tradingCapital)
    const riskPct = Number.parseFloat(riskPercentage)
    const costPerUnit = Number.parseFloat(dollarCostPerUnit)
    const stopLoss = Number.parseFloat(stopLossPoints)
    const conversionFactor = Number.parseFloat(unitToVolumeConversion)

    if (capital > 0 && riskPct > 0 && costPerUnit > 0 && stopLoss > 0 && conversionFactor > 0) {
      const maxDollarRisk = capital * (riskPct / 100)
      const riskPerUnit = costPerUnit * stopLoss
      const rawTradeVolume = maxDollarRisk / riskPerUnit
      const finalVolume = rawTradeVolume * conversionFactor

      setCalculatedVolume(finalVolume)
      setCalculationBreakdown({
        maxDollarRisk,
        riskPerUnit,
        rawTradeVolume,
        finalVolume,
      })
    } else {
      setCalculatedVolume(null)
      setCalculationBreakdown(null)
    }
  }, [tradingCapital, riskPercentage, dollarCostPerUnit, stopLossPoints, unitToVolumeConversion])

  const addCustomInstrument = () => {
    if (newInstrumentName && newDollarCost && newUnitConversion && newLotSize) {
      const newInstrument: Instrument = {
        name: newInstrumentName,
        dollarCostPerUnit: Number.parseFloat(newDollarCost),
        unitToVolumeConversion: Number.parseFloat(newUnitConversion),
        standardLotSize: Number.parseFloat(newLotSize),
      }

      setCustomInstruments([...customInstruments, newInstrument])

      setNewInstrumentName("")
      setNewDollarCost("")
      setNewUnitConversion("")
      setNewLotSize("")
    }
  }

  const deleteCustomInstrument = (instrumentName: string) => {
    setCustomInstruments(customInstruments.filter((i) => i.name !== instrumentName))

    if (selectedInstrument === instrumentName) {
      handleInstrumentChange("SPX500")
    }
  }

  const selectedInstrumentData = allInstruments.find((i) => i.name === selectedInstrument)
  const maxDollarRisk = Number.parseFloat(tradingCapital) * (Number.parseFloat(riskPercentage) / 100)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Trading Volume Calculator</h1>
          </div>
          <p className="text-gray-600">Calculate optimal trade volume based on risk management parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Trading Parameters */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Calculator className="h-5 w-5 text-blue-600" />
                Trading Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trading Capital */}
              <div className="space-y-2">
                <Label htmlFor="tradingCapital" className="text-sm font-medium text-gray-700">
                  Trading Capital
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="tradingCapital"
                    type="number"
                    value={tradingCapital}
                    onChange={(e) => setTradingCapital(e.target.value)}
                    className="pl-8 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    step="100"
                  />
                </div>
              </div>

              {/* Risk Percentage */}
              <div className="space-y-2">
                <Label htmlFor="riskPercentage" className="text-sm font-medium text-gray-700">
                  Risk Percentage
                </Label>
                <div className="relative">
                  <Input
                    id="riskPercentage"
                    type="number"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(e.target.value)}
                    className="pr-8 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              {/* Maximum Dollar Risk */}
              <div className="space-y-2">
                <Label htmlFor="maxRisk" className="text-sm font-medium text-gray-700">
                  Maximum Dollar Risk (Calculated)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="maxRisk"
                    type="text"
                    value={isNaN(maxDollarRisk) ? "0.00" : maxDollarRisk.toFixed(2)}
                    className="pl-8 h-11 border-gray-300 bg-gray-50 text-gray-600"
                    readOnly
                  />
                </div>
              </div>

              {/* Trading Instrument */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Trading Instrument</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Manage Custom Instruments</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Input
                            placeholder="Instrument Name"
                            value={newInstrumentName}
                            onChange={(e) => setNewInstrumentName(e.target.value)}
                          />
                          <Input
                            placeholder="Cost per unit"
                            type="number"
                            step="0.001"
                            value={newDollarCost}
                            onChange={(e) => setNewDollarCost(e.target.value)}
                          />
                          <Input
                            placeholder="Conversion factor"
                            type="number"
                            step="0.01"
                            value={newUnitConversion}
                            onChange={(e) => setNewUnitConversion(e.target.value)}
                          />
                          <Input
                            placeholder="Lot size"
                            type="number"
                            step="0.01"
                            value={newLotSize}
                            onChange={(e) => setNewLotSize(e.target.value)}
                          />
                          <Button onClick={addCustomInstrument} className="w-full">
                            Add Instrument
                          </Button>
                        </div>

                        {customInstruments.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Custom Instruments:</h4>
                            {customInstruments.map((instrument) => (
                              <div
                                key={instrument.name}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm font-medium">{instrument.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCustomInstrument(instrument.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedInstrument} onValueChange={handleInstrumentChange}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_INSTRUMENTS.map((instrument) => (
                      <SelectItem key={instrument.name} value={instrument.name}>
                        {instrument.name}
                      </SelectItem>
                    ))}
                    {customInstruments.map((instrument) => (
                      <SelectItem key={instrument.name} value={instrument.name}>
                        {instrument.name} (Custom)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Instrument Details */}
              {selectedInstrumentData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Instrument Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Cost per unit:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        ${selectedInstrumentData.dollarCostPerUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Conversion:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {selectedInstrumentData.unitToVolumeConversion}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stop Loss */}
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-sm font-medium text-gray-700">
                  Stop Loss (Points)
                </Label>
                <Input
                  id="stopLoss"
                  type="number"
                  value={stopLossPoints}
                  onChange={(e) => setStopLossPoints(e.target.value)}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Calculation Results */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recommended Volume */}
              {calculatedVolume !== null ? (
                <div className="bg-blue-600 text-white p-6 rounded-lg text-center">
                  <div className="text-sm font-medium mb-1">Recommended Volume</div>
                  <div className="text-4xl font-bold mb-1">{calculatedVolume.toFixed(2)}</div>
                  <div className="text-blue-100">lots</div>
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-500 p-6 rounded-lg text-center">
                  <div className="text-sm font-medium mb-1">Recommended Volume</div>
                  <div className="text-4xl font-bold mb-1">--</div>
                  <div className="text-gray-400">lots</div>
                </div>
              )}

              {/* Calculation Breakdown */}
              {calculationBreakdown && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Calculation Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Max dollar risk:</span>
                      <span className="font-medium">${calculationBreakdown.maxDollarRisk.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Risk per unit:</span>
                      <span className="font-medium">${calculationBreakdown.riskPerUnit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Raw trade volume:</span>
                      <span className="font-medium">{calculationBreakdown.rawTradeVolume.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 font-medium text-green-600">
                      <span>Final volume:</span>
                      <span>{calculationBreakdown.finalVolume.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
