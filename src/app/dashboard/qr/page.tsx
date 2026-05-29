'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Coffee, Waves, Dumbbell, Users, QrCode, Lock, ShoppingBag, Scan, CheckCircle, Calendar } from 'lucide-react'

interface Locker {
    id: string
    lockerNumber: number
    status: string
}

interface Equipment {
    id: string
    name: string
    category: string
    availableQty: number
}

export default function QrPage() {
    const [lockers, setLockers] = useState<Locker[]>([])
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [scanResult, setScanResult] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lockersRes = await fetch('/api/branches/1/lockers')
                if (lockersRes.ok) {
                    const lockersData = await lockersRes.json()
                    setLockers(lockersData)
                }
                const equipRes = await fetch('/api/branches/1/equipment')
                if (equipRes.ok) {
                    const equipData = await equipRes.json()
                    setEquipment(equipData)
                }
            } catch (error) {
                console.error('Error fetching QR data:', error)
            }
        }
        fetchData()
    }, [])

    const handleScan = () => {
        setScanResult('QR code scanned successfully!')
        setTimeout(() => setScanResult(null), 3000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">QR Self-Service</h1>
                <p className="text-slate-600 mt-1">Quick access for check-ins, lockers, and equipment</p>
            </div>

            {/* QR Scanner Section */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-8 text-center">
                    <QrCode className="h-20 w-20 mx-auto text-emerald-600 mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Scan QR Code</h3>
                    <p className="text-slate-600 mb-4">Point your camera at QR codes for entry and services</p>
                    <Button 
                        size="lg" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleScan}
                    >
                        <Scan className="h-5 w-5 mr-2" />
                        Open Scanner
                    </Button>
                    
                    {scanResult && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">{scanResult}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Smart Lockers */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Smart Lockers</h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                    {lockers.slice(0, 20).map((locker) => (
                        <Card 
                            key={locker.id} 
                            className={`text-center p-4 ${
                                locker.status === 'available' ? 'border-emerald-200 bg-emerald-50' : 
                                'border-slate-200 bg-slate-50'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Lock className={`h-6 w-6 ${
                                    locker.status === 'available' ? 'text-emerald-600' : 'text-slate-400'
                                }`} />
                                <span className="font-medium text-sm">{locker.lockerNumber}</span>
                                <span className={`text-xs capitalize ${
                                    locker.status === 'available' ? 'text-emerald-600' : 'text-slate-500'
                                }`}>
                                    {locker.status}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Equipment Rental */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Equipment Rental</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                        <ShoppingBag className="h-6 w-6 text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-sm text-slate-500 capitalize">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">Available</p>
                                        <p className="font-bold text-emerald-600">{item.availableQty}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}