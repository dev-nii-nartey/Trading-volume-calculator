"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Calculator, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Instrument {
  name: string
  dollarCostPerUnit: number
  unitToVolumeConversion: number
  standardLotSize: number
}

const DEFAULT_INSTRUMENTS: Instrument[] = [
  { name: "SPX500", dollarCostPerUnit: 1.008, unitToVolumeConversion: 0.1, standardLotSize: 0.5 },
  { name: "NAS100", dollarCostPerUnit: 0.25, unitToVolumeConversion: 0.1, standardLotSize: 0.5 },
  { name: "EURUSD", dollarCostPerUnit: 1.0, unitToVolumeConversion: 0.01, standardLotSize: 0.01 },
  { name: "GBPUSD", dollarCostPerUnit: 1.0, unitToVolumeConversion: 0.01, standardLotSize: 0.01 },
]

export default function TradingCalculator() {
  const [maxRisk, setMaxRisk] = useState<string>("60")
  const [selectedInstrument, setSelectedInstrument] = useState<string>("SPX500")
  const [dollarCostPerUnit, setDollarCostPerUnit] = useState<string>("1.008")
  const [stopLossPoints, setStopLossPoints] = useState<string>("12")
  const [unitToVolumeConversion, setUnitToVolumeConversion] = useState<string>("0.10")
  const [standardLotSize, setStandardLotSize] = useState<string>("0.50")
  const [customInstruments, setCustomInstruments] = useState<Instrument[]>([])
  const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null)
  const [calculationBreakdown, setCalculationBreakdown] = useState<{
    step1: number
    step2: number
    step3: number
    step4: number
    finalVolume: number
  } | null>(null)

  // Custom instrument form
  const [newInstrumentName, setNewInstrumentName] = useState<string>("")
  const [newDollarCost, setNewDollarCost] = useState<string>("")
  const [newUnitConversion, setNewUnitConversion] = useState<string>("")
  const [newLotSize, setNewLotSize] = useState<string>("")

  // Load custom instruments from localStorage on mount
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

  // Save custom instruments to localStorage
  useEffect(() => {
    localStorage.setItem("customInstruments", JSON.stringify(customInstruments))
  }, [customInstruments])

  const allInstruments = [...DEFAULT_INSTRUMENTS, ...customInstruments]

  // Update form fields when instrument selection changes
  const handleInstrumentChange = (instrumentName: string) => {
    setSelectedInstrument(instrumentName)
    const instrument = allInstruments.find((i) => i.name === instrumentName)
    if (instrument) {
      setDollarCostPerUnit(instrument.dollarCostPerUnit.toString())
      setUnitToVolumeConversion(instrument.unitToVolumeConversion.toString())
      setStandardLotSize(instrument.standardLotSize.toString())
    }
  }

  // Calculate trade volume
  const calculateVolume = () => {
    const risk = Number.parseFloat(maxRisk)
    const costPerUnit = Number.parseFloat(dollarCostPerUnit)
    const stopLoss = Number.parseFloat(stopLossPoints)
    const conversionFactor = Number.parseFloat(unitToVolumeConversion)
    const lotSize = Number.parseFloat(standardLotSize)

    if (risk > 0 && costPerUnit > 0 && stopLoss > 0 && conversionFactor > 0 && lotSize > 0) {
      // Step 1: Maximum dollar risk (already provided by user)
      const step1MaxRisk = risk

      // Step 2: Calculate the dollar cost of stop loss for single unit
      const step2DollarCost = costPerUnit * stopLoss

      // Step 3: Calculate required trade volume (units needed)
      const step3TradeUnits = risk / step2DollarCost

      // Step 4: Convert units to volume
      const step4Volume = step3TradeUnits * conversionFactor

      // Round down to nearest standard lot size
      const finalVolume = Math.floor(step4Volume / lotSize) * lotSize

      setCalculatedVolume(finalVolume)
      setCalculationBreakdown({
        step1: step1MaxRisk,
        step2: step2DollarCost,
        step3: step3TradeUnits,
        step4: step4Volume,
        finalVolume: finalVolume,
      })
    }
  }

  // Add custom instrument
  const addCustomInstrument = () => {
    if (newInstrumentName && newDollarCost && newUnitConversion && newLotSize) {
      const newInstrument: Instrument = {
        name: newInstrumentName,
        dollarCostPerUnit: Number.parseFloat(newDollarCost),
        unitToVolumeConversion: Number.parseFloat(newUnitConversion),
        standardLotSize: Number.parseFloat(newLotSize),
      }

      setCustomInstruments([...customInstruments, newInstrument])

      // Clear form
      setNewInstrumentName("")
      setNewDollarCost("")
      setNewUnitConversion("")
      setNewLotSize("")
    }
  }

  // Delete custom instrument
  const deleteCustomInstrument = (instrumentName: string) => {
    setCustomInstruments(customInstruments.filter((i) => i.name !== instrumentName))

    // If deleted instrument was selected, switch to default
    if (selectedInstrument === instrumentName) {
      handleInstrumentChange("SPX500")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Volume Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Calculate optimal trade volume based on your risk tolerance and instrument parameters. Supports default
            instruments and custom configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Calculator */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Volume Calculator
              </CardTitle>
              <CardDescription>Enter your trading parameters to calculate the optimal volume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxRisk">Maximum Dollar Risk ($)</Label>
                <Input
                  id="maxRisk"
                  type="number"
                  value={maxRisk}
                  onChange={(e) => setMaxRisk(e.target.value)}
                  placeholder="60"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrument">Trading Instrument</Label>
                <Select value={selectedInstrument} onValueChange={handleInstrumentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_INSTRUMENTS.map((instrument) => (
                      <SelectItem key={instrument.name} value={instrument.name}>
                        {instrument.name} (Default)
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

              <div className="space-y-2">
                <Label htmlFor="dollarCost">Dollar Cost Per Unit ($)</Label>
                <Input
                  id="dollarCost"
                  type="number"
                  value={dollarCostPerUnit}
                  onChange={(e) => setDollarCostPerUnit(e.target.value)}
                  step="0.001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (Points)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  value={stopLossPoints}
                  onChange={(e) => setStopLossPoints(e.target.value)}
                  placeholder="12"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitConversion">Unit-to-Volume Conversion Factor</Label>
                <Input
                  id="unitConversion"
                  type="number"
                  value={unitToVolumeConversion}
                  onChange={(e) => setUnitToVolumeConversion(e.target.value)}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lotSize">Standard Lot Size</Label>
                <Input
                  id="lotSize"
                  type="number"
                  value={standardLotSize}
                  onChange={(e) => setStandardLotSize(e.target.value)}
                  step="0.01"
                />
              </div>

              <Button onClick={calculateVolume} className="w-full" size="lg">
                Calculate Volume
              </Button>

              {calculatedVolume !== null && calculationBreakdown && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>Final Trade Volume: {calculatedVolume.toFixed(2)} lots</strong>
                      <br />
                      <span className="text-sm text-green-600 dark:text-green-300">
                        Volume rounded down to nearest standard lot size
                      </span>
                    </AlertDescription>
                  </Alert>

                  {/* Automated Calculation Breakdown */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-800 dark:text-blue-200">
                        Automated Calculation Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="font-medium">Step 1: Maximum Dollar Risk</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono">
                          ${calculationBreakdown.step1.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="font-medium">Step 2: Dollar Cost of Stop Loss</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono">
                          {stopLossPoints} pts × ${dollarCostPerUnit} = ${calculationBreakdown.step2.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="font-medium">Step 3: Required Trade Units</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono">
                          ${calculationBreakdown.step1.toFixed(2)} ÷ ${calculationBreakdown.step2.toFixed(2)} ={" "}
                          {calculationBreakdown.step3.toFixed(2)} units
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="font-medium">Step 4: Convert to Volume</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono">
                          {calculationBreakdown.step3.toFixed(2)} × {unitToVolumeConversion} ={" "}
                          {calculationBreakdown.step4.toFixed(3)} volume
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-800">
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          Final: Rounded to Lot Size
                        </span>
                        <span className="text-green-700 dark:text-green-300 font-mono font-semibold">
                          {calculationBreakdown.finalVolume.toFixed(2)} lots
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Instruments Manager */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Custom Instruments
              </CardTitle>
              <CardDescription>Add and manage your custom trading instruments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Instrument Name (e.g., GOLD)"
                  value={newInstrumentName}
                  onChange={(e) => setNewInstrumentName(e.target.value)}
                />
                <Input
                  placeholder="Dollar Cost Per Unit"
                  type="number"
                  step="0.001"
                  value={newDollarCost}
                  onChange={(e) => setNewDollarCost(e.target.value)}
                />
                <Input
                  placeholder="Unit-to-Volume Conversion"
                  type="number"
                  step="0.01"
                  value={newUnitConversion}
                  onChange={(e) => setNewUnitConversion(e.target.value)}
                />
                <Input
                  placeholder="Standard Lot Size"
                  type="number"
                  step="0.01"
                  value={newLotSize}
                  onChange={(e) => setNewLotSize(e.target.value)}
                />
                <Button onClick={addCustomInstrument} className="w-full">
                  Add Custom Instrument
                </Button>
              </div>

              {customInstruments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Your Custom Instruments:</h4>
                  {customInstruments.map((instrument) => (
                    <div
                      key={instrument.name}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{instrument.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${instrument.dollarCostPerUnit} • {instrument.unitToVolumeConversion} •{" "}
                          {instrument.standardLotSize}
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteCustomInstrument(instrument.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Default Instruments Reference */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Default Instrument Parameters</CardTitle>
            <CardDescription>Reference values for the built-in trading instruments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEFAULT_INSTRUMENTS.map((instrument) => (
                <div key={instrument.name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-lg">{instrument.name}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>${instrument.dollarCostPerUnit} per point</div>
                    <div>{instrument.unitToVolumeConversion} unit-to-volume</div>
                    <div>{instrument.standardLotSize} lot size</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
