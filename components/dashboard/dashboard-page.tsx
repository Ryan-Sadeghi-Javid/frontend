"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  Target,
  Zap,
  Network,
  Globe,
  Link,
} from "lucide-react"

// Enhanced sample data with cross-platform focus
const velocityData = [
  {
    platform: "Instagram",
    avgReportTime: 2.3,
    avgResolutionTime: 18.5,
    totalReports: 1247,
    crossPlatformIncidents: 892,
  },
  {
    platform: "Facebook",
    avgReportTime: 1.8,
    avgResolutionTime: 22.1,
    totalReports: 2156,
    crossPlatformIncidents: 1534,
  },
  { platform: "WhatsApp", avgReportTime: 3.1, avgResolutionTime: 15.2, totalReports: 892, crossPlatformIncidents: 645 },
  {
    platform: "Messenger",
    avgReportTime: 2.7,
    avgResolutionTime: 19.8,
    totalReports: 634,
    crossPlatformIncidents: 456,
  },
  {
    platform: "Twitter",
    avgReportTime: 1.5,
    avgResolutionTime: 31.2,
    totalReports: 1823,
    crossPlatformIncidents: 1245,
  },
  { platform: "TikTok", avgReportTime: 4.2, avgResolutionTime: 28.7, totalReports: 1456, crossPlatformIncidents: 987 },
]

// Cross-platform impact data
const crossPlatformData = [
  { platforms: "1 Platform", incidents: 2847, percentage: 34.2 },
  { platforms: "2 Platforms", incidents: 3156, percentage: 37.9 },
  { platforms: "3 Platforms", incidents: 1534, percentage: 18.4 },
  { platforms: "4+ Platforms", incidents: 789, percentage: 9.5 },
]

// Platform interconnection data
const platformConnections = [
  { source: "Instagram", target: "Facebook", incidents: 1245, strength: "high" },
  { source: "Facebook", target: "Messenger", incidents: 987, strength: "high" },
  { source: "Instagram", target: "WhatsApp", incidents: 756, strength: "medium" },
  { source: "Twitter", target: "Instagram", incidents: 634, strength: "medium" },
  { source: "TikTok", target: "Instagram", incidents: 523, strength: "medium" },
  { source: "WhatsApp", target: "Messenger", incidents: 445, strength: "low" },
]

// Multi-platform attack patterns
const attackPatterns = [
  {
    pattern: "Account Takeover Chain",
    platforms: ["Instagram", "Facebook", "WhatsApp"],
    incidents: 456,
    trend: "increasing",
  },
  { pattern: "Impersonation Network", platforms: ["Instagram", "Twitter", "TikTok"], incidents: 334, trend: "stable" },
  { pattern: "Fraud Campaign", platforms: ["Facebook", "WhatsApp", "Messenger"], incidents: 278, trend: "decreasing" },
  {
    pattern: "Coordinated Harassment",
    platforms: ["Twitter", "Instagram", "TikTok", "Facebook"],
    incidents: 189,
    trend: "increasing",
  },
]

const harmTypesData = [
  { name: "Hacked Account Takeover", known: 1247, inferred: 234, color: "#ef4444", crossPlatform: 89 },
  { name: "Impersonation", known: 892, inferred: 156, color: "#f97316", crossPlatform: 76 },
  { name: "Fraud/Scam", known: 2156, inferred: 445, color: "#8b5cf6", crossPlatform: 82 },
  { name: "Harassment", known: 634, inferred: 89, color: "#06b6d4", crossPlatform: 67 },
  { name: "Hate Speech", known: 445, inferred: 67, color: "#84cc16", crossPlatform: 45 },
  { name: "NCII (Non-consensual)", known: 234, inferred: 78, color: "#ec4899", crossPlatform: 91 },
]

const trendsData = [
  { month: "Jan", reports: 1200, resolved: 1150, dsaCompliant: 1100, tidCompliant: 1140, crossPlatform: 756 },
  { month: "Feb", reports: 1350, resolved: 1280, dsaCompliant: 1220, tidCompliant: 1270, crossPlatform: 891 },
  { month: "Mar", reports: 1180, resolved: 1120, dsaCompliant: 1050, tidCompliant: 1110, crossPlatform: 826 },
  { month: "Apr", reports: 1420, resolved: 1380, dsaCompliant: 1300, tidCompliant: 1360, crossPlatform: 994 },
  { month: "May", reports: 1650, resolved: 1590, dsaCompliant: 1480, tidCompliant: 1570, crossPlatform: 1155 },
  { month: "Jun", reports: 1890, resolved: 1820, dsaCompliant: 1720, tidCompliant: 1800, crossPlatform: 1323 },
]

const dsaComplianceData = [
  { platform: "Instagram", within48h: 87, total: 100, percentage: 87 },
  { platform: "Facebook", within48h: 92, total: 100, percentage: 92 },
  { platform: "WhatsApp", within48h: 78, total: 100, percentage: 78 },
  { platform: "Twitter", within48h: 65, total: 100, percentage: 65 },
  { platform: "TikTok", within48h: 71, total: 100, percentage: 71 },
]

const tidComplianceData = [
  { platform: "Instagram", within24h: 94, total: 100, percentage: 94 },
  { platform: "Facebook", within24h: 89, total: 100, percentage: 89 },
  { platform: "Twitter", within24h: 82, total: 100, percentage: 82 },
  { platform: "TikTok", within24h: 76, total: 100, percentage: 76 },
]

const getComplianceColor = (percentage: number) => {
  if (percentage >= 90) return "text-green-600 bg-green-50"
  if (percentage >= 75) return "text-yellow-600 bg-yellow-50"
  return "text-red-600 bg-red-50"
}

const getComplianceIcon = (percentage: number) => {
  if (percentage >= 90) return <CheckCircle2 className="h-4 w-4" />
  if (percentage >= 75) return <AlertTriangle className="h-4 w-4" />
  return <XCircle className="h-4 w-4" />
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-red-600" />
    case "decreasing":
      return <TrendingDown className="h-4 w-4 text-green-600" />
    default:
      return <Activity className="h-4 w-4 text-gray-600" />
  }
}

export default function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months")

  const totalReports = velocityData.reduce((sum, item) => sum + item.totalReports, 0)
  const totalCrossPlatformIncidents = velocityData.reduce((sum, item) => sum + item.crossPlatformIncidents, 0)
  const crossPlatformPercentage = ((totalCrossPlatformIncidents / totalReports) * 100).toFixed(1)
  const avgPlatformsPerIncident = (
    crossPlatformData.reduce((sum, item) => {
      const platformCount = item.platforms === "4+ Platforms" ? 4 : Number.parseInt(item.platforms)
      return sum + platformCount * item.incidents
    }, 0) / crossPlatformData.reduce((sum, item) => sum + item.incidents, 0)
  ).toFixed(1)

  const avgResolutionTime = velocityData.reduce((sum, item) => sum + item.avgResolutionTime, 0) / velocityData.length
  const overallDSACompliance =
    dsaComplianceData.reduce((sum, item) => sum + item.percentage, 0) / dsaComplianceData.length
  const overallTIDCompliance =
    tidComplianceData.reduce((sum, item) => sum + item.percentage, 0) / tidComplianceData.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cross-Platform Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor incidents spanning multiple platforms and their regulatory compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics with Cross-Platform Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{totalReports.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Cross-Platform Impact</p>
                <p className="text-3xl font-bold text-orange-900">{crossPlatformPercentage}%</p>
                <div className="flex items-center mt-2">
                  <Network className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">
                    {totalCrossPlatformIncidents.toLocaleString()} incidents
                  </span>
                </div>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <Network className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Platforms/Incident</p>
                <p className="text-3xl font-bold text-purple-900">{avgPlatformsPerIncident}</p>
                <div className="flex items-center mt-2">
                  <Globe className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-600">Multi-platform attacks</span>
                </div>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Globe className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DSA Compliance</p>
                <p className="text-3xl font-bold text-gray-900">{overallDSACompliance.toFixed(0)}%</p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-gray-600">48h mandate</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Take It Down</p>
                <p className="text-3xl font-bold text-gray-900">{overallTIDCompliance.toFixed(0)}%</p>
                <div className="flex items-center mt-2">
                  <Zap className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-gray-600">24h mandate</span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Platform Impact Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-orange-600" />
              Platform Impact Distribution
            </CardTitle>
            <p className="text-sm text-gray-600">How many platforms are affected per incident</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={crossPlatformData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="incidents"
                  label={({ platforms, percentage }) => `${platforms}: ${percentage}%`}
                >
                  {crossPlatformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-purple-600" />
              Multi-Platform Attack Patterns
            </CardTitle>
            <p className="text-sm text-gray-600">Common coordinated attack patterns across platforms</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attackPatterns.map((pattern, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(pattern.trend)}
                      <span className="text-sm font-medium">{pattern.incidents}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {pattern.platforms.map((platform, pIndex) => (
                      <Badge key={pIndex} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 capitalize">Trend: {pattern.trend}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cross-platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 gap-2">
          <TabsTrigger
            value="cross-platform"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-orange-100 data-[state=active]:border-orange-500 data-[state=active]:text-orange-700 transition"
          >
            Cross-Platform Analysis
          </TabsTrigger>
          <TabsTrigger
            value="velocity"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 transition"
          >
            Platform Velocity
          </TabsTrigger>
          <TabsTrigger
            value="harm-types"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 transition"
          >
            Harm Types Analysis
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 transition"
          >
            Compliance Trends
          </TabsTrigger>
          <TabsTrigger
            value="regulatory"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 transition"
          >
            Regulatory Barometers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cross-platform" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Platform vs Single Platform Incidents</CardTitle>
                <p className="text-sm text-gray-600">Comparison of incident scope across platforms</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalReports" fill="#94a3b8" name="Total Reports" />
                    <Bar dataKey="crossPlatformIncidents" fill="#f97316" name="Cross-Platform Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Interconnection Strength</CardTitle>
                <p className="text-sm text-gray-600">How often platforms are targeted together</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformConnections.map((connection, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{connection.source}</Badge>
                          <span className="text-gray-400">→</span>
                          <Badge variant="outline">{connection.target}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{connection.incidents}</span>
                        <Badge
                          variant={
                            connection.strength === "high"
                              ? "destructive"
                              : connection.strength === "medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {connection.strength}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cross-Platform Impact Trends</CardTitle>
              <p className="text-sm text-gray-600">Monthly trends showing the growth of multi-platform incidents</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    stackId="1"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.6}
                    name="Total Reports"
                  />
                  <Area
                    type="monotone"
                    dataKey="crossPlatform"
                    stackId="2"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.8}
                    name="Cross-Platform Incidents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reporting Velocity</CardTitle>
                <p className="text-sm text-gray-600">Average time from incident to report submission</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="avgReportTime" fill="#3b82f6" name="Avg Report Time" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Time by Platform</CardTitle>
                <p className="text-sm text-gray-600">Average time from report to resolution</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="avgResolutionTime" fill="#10b981" name="Avg Resolution Time" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Platform</th>
                      <th className="text-left p-3">Total Reports</th>
                      <th className="text-left p-3">Cross-Platform %</th>
                      <th className="text-left p-3">Avg Report Time</th>
                      <th className="text-left p-3">Avg Resolution Time</th>
                      <th className="text-left p-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {velocityData.map((platform) => (
                      <tr key={platform.platform} className="border-b">
                        <td className="p-3 font-medium">{platform.platform}</td>
                        <td className="p-3">{platform.totalReports.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {((platform.crossPlatformIncidents / platform.totalReports) * 100).toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="p-3">{platform.avgReportTime}h</td>
                        <td className="p-3">{platform.avgResolutionTime}h</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              platform.avgResolutionTime < 20
                                ? "default"
                                : platform.avgResolutionTime < 30
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {platform.avgResolutionTime < 20
                              ? "Excellent"
                              : platform.avgResolutionTime < 30
                                ? "Good"
                                : "Needs Improvement"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harm-types" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Harm Types Distribution</CardTitle>
                <p className="text-sm text-gray-600">Known vs Inferred harm classifications</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={harmTypesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="known" fill="#3b82f6" name="Known" />
                    <Bar dataKey="inferred" fill="#94a3b8" name="Inferred" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cross-Platform Harm Impact</CardTitle>
                <p className="text-sm text-gray-600">Percentage of each harm type affecting multiple platforms</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {harmTypesData.map((harm) => (
                    <div key={harm.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{harm.name}</span>
                        <span className="font-bold text-orange-600">{harm.crossPlatform}%</span>
                      </div>
                      <Progress value={harm.crossPlatform} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Harm Analysis with Cross-Platform Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {harmTypesData.map((harm) => (
                  <div key={harm.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: harm.color }}></div>
                      <div>
                        <h4 className="font-medium">{harm.name}</h4>
                        <p className="text-sm text-gray-600">
                          {harm.known} confirmed, {harm.inferred} inferred
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{(harm.known + harm.inferred).toLocaleString()}</p>
                      <p className="text-sm text-orange-600 font-medium">{harm.crossPlatform}% cross-platform</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends Over Time</CardTitle>
              <p className="text-sm text-gray-600">Monthly performance against regulatory mandates</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Total Reports"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Resolved"
                  />
                  <Area
                    type="monotone"
                    dataKey="dsaCompliant"
                    stackId="3"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                    name="DSA Compliant"
                  />
                  <Area
                    type="monotone"
                    dataKey="tidCompliant"
                    stackId="4"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="TID Compliant"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DSA Compliance Trend</CardTitle>
                <p className="text-sm text-gray-600">48-hour response mandate compliance</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="dsaCompliant"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      name="DSA Compliant"
                    />
                    <Line
                      type="monotone"
                      dataKey="reports"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      name="Total Reports"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Take It Down Compliance</CardTitle>
                <p className="text-sm text-gray-600">24-hour NCII takedown compliance</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="tidCompliant"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      name="TID Compliant"
                    />
                    <Line
                      type="monotone"
                      dataKey="reports"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      name="Total Reports"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  DSA 48-Hour Compliance Barometer
                </CardTitle>
                <p className="text-sm text-gray-600">
                  EU Digital Services Act mandates response to illegal content within 48 hours
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{overallDSACompliance.toFixed(0)}%</div>
                  <p className="text-sm text-purple-700">Overall DSA Compliance Rate</p>
                </div>

                <div className="space-y-3">
                  {dsaComplianceData.map((platform) => (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${getComplianceColor(platform.percentage)}`}>
                          {getComplianceIcon(platform.percentage)}
                        </div>
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={platform.percentage} className="w-24" />
                        <span className="text-sm font-medium w-12">{platform.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>DSA Requirement:</strong> Platforms must respond to notices of illegal content within 48
                    hours, providing clear reasoning for their decisions and ensuring transparency in content
                    moderation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  Take It Down Act Compliance
                </CardTitle>
                <p className="text-sm text-gray-600">24-hour mandate for non-consensual intimate image removal</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">{overallTIDCompliance.toFixed(0)}%</div>
                  <p className="text-sm text-red-700">Overall TID Compliance Rate</p>
                </div>

                <div className="space-y-3">
                  {tidComplianceData.map((platform) => (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${getComplianceColor(platform.percentage)}`}>
                          {getComplianceIcon(platform.percentage)}
                        </div>
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={platform.percentage} className="w-24" />
                        <span className="text-sm font-medium w-12">{platform.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-800">
                    <strong>Take It Down Requirement:</strong> Platforms must remove non-consensual intimate images
                    within 24 hours of receiving a valid report, with expedited processes for victim protection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {dsaComplianceData.filter((p) => p.percentage >= 90).length}
                  </div>
                  <p className="text-sm text-green-700">Platforms Exceeding DSA Standards</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {tidComplianceData.filter((p) => p.percentage >= 90).length}
                  </div>
                  <p className="text-sm text-blue-700">Platforms Exceeding TID Standards</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {dsaComplianceData.filter((p) => p.percentage < 75).length}
                  </div>
                  <p className="text-sm text-yellow-700">Platforms Below DSA Threshold</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {tidComplianceData.filter((p) => p.percentage < 75).length}
                  </div>
                  <p className="text-sm text-red-700">Platforms Below TID Threshold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
