"use client"

import { useEffect, useState } from "react"
import { useAuth } from "react-oidc-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import {
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  User,
  Globe,
  Shield,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchUserIncidents } from "@/lib/api/fetchUserIncidents"

interface Incident {
  incidentId: string
  createdAt: string
  status: string
  userId: string
  userBlock: {
    firstName: string
    lastName: string
    emailAddress: string
    userEmail?: string | null
  }
  incidentBlock: {
    primaryHarmType: string
    country?: string
    city?: string | null
    violationReason?: string
    incidentClassification?: string | null
    violationCode?: string | null
    affectedPlatforms: Array<{
      platform: string
      profileUrls: string[]
      userCount: number
    }>
    dynamicExtras?: {
      realAccountUrl?: string
      fakeAccountUrls?: string
      proofOfRealAccount?: string
      evidenceFileKeys?: string[]
      sumSubVerificationId?: string
      [key: string]: any
    }
    platformForDynamicQuestions?: string
    typeOfSupportProvided?: string | null
    culturalContext?: string | null
    hackedElsewhere?: string | null
    hackedElsewhereDetails?: string | null
    crossPlatformDetails?: string | null
    platformsSummary?: string[]
  }
  evidenceMeta: Record<string, any>
  raw: Record<string, any>
}

type SortField = "createdAt" | "status" | "primaryHarmType" | "country" | "platformCount"
type SortDirection = "asc" | "desc"

interface FilterState {
  status: string[]
  harmType: string[]
  country: string[]
  dateRange: string
  platformCount: string
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "in_progress":
    case "in progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "resolved":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
    case "declined":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return <FileText className="h-4 w-4" />
    case "pending":
      return <Clock className="h-4 w-4" />
    case "in_progress":
    case "in progress":
      return <RefreshCw className="h-4 w-4" />
    case "resolved":
    case "completed":
      return <CheckCircle2 className="h-4 w-4" />
    case "rejected":
    case "declined":
      return <XCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getHarmTypeColor = (harmType: string) => {
  switch (harmType) {
    case "Hacked Account Take over":
      return "bg-red-50 text-red-700 border-red-200"
    case "Impersonation":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "Fraud/Scam":
      return "bg-purple-50 text-purple-700 border-purple-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const transformStatus = (status: string) => {
  if (status.toLowerCase() === "verified") {
    return "pending"
  }
  return status
}

const isUnverifiedDraft = (incident: Incident) => {
  const status = incident.status?.toLowerCase()
  const verificationId = incident.incidentBlock?.dynamicExtras?.sumSubVerificationId
  const isDraft = status === "draft"
  const isMissingVerification = !verificationId
  return isDraft && isMissingVerification
}

export default function ReportsPage() {
  const auth = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    harmType: [],
    country: [],
    dateRange: "all",
    platformCount: "all",
  })

  // Filter options derived from data
  const [filterOptions, setFilterOptions] = useState({
    statuses: [] as string[],
    harmTypes: [] as string[],
    countries: [] as string[],
  })

  const fetchData = async () => {
    if (!auth.isAuthenticated || !auth.user?.access_token) return

    try {
      setLoading(true)
      setError(null)
      const token = auth.user.access_token
      localStorage.setItem("accessToken", token)
      const data = await fetchUserIncidents(token)

      if (Array.isArray(data)) {
        setIncidents(data)

        // Extract unique values for filter options
        const statuses = [...new Set(data.map((i) => transformStatus(i.status)))]
        const harmTypes = [...new Set(data.map((i) => i.incidentBlock.primaryHarmType))]
        const countries = [...new Set(data.map((i) => i.incidentBlock.country).filter(Boolean))]

        setFilterOptions({
          statuses: statuses.sort(),
          harmTypes: harmTypes.sort(),
          countries: countries.sort(),
        })
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch incidents")
    } finally {
      setLoading(false)
    }
  }

  // Apply filters and search
  useEffect(() => {
    const filtered = incidents.filter((incident) => {
      // Search filter
      const searchMatch =
        !searchTerm ||
        incident.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incidentBlock.primaryHarmType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incidentBlock.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incidentBlock.violationReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transformStatus(incident.status).toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const statusMatch = filters.status.length === 0 || filters.status.includes(transformStatus(incident.status))

      // Harm type filter
      const harmTypeMatch =
        filters.harmType.length === 0 || filters.harmType.includes(incident.incidentBlock.primaryHarmType)

      // Country filter
      const countryMatch =
        filters.country.length === 0 ||
        (incident.incidentBlock.country && filters.country.includes(incident.incidentBlock.country))

      // Date range filter
      const dateMatch = (() => {
        if (filters.dateRange === "all") return true
        const incidentDate = new Date(incident.createdAt)
        const now = new Date()

        switch (filters.dateRange) {
          case "7days":
            return incidentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          case "30days":
            return incidentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          case "90days":
            return incidentDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          default:
            return true
        }
      })()

      // Platform count filter
      const platformMatch = (() => {
        if (filters.platformCount === "all") return true
        const platformCount = incident.incidentBlock.affectedPlatforms?.length || 0

        switch (filters.platformCount) {
          case "single":
            return platformCount === 1
          case "multiple":
            return platformCount > 1
          default:
            return true
        }
      })()

      return searchMatch && statusMatch && harmTypeMatch && countryMatch && dateMatch && platformMatch
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "status":
          aValue = transformStatus(a.status)
          bValue = transformStatus(b.status)
          break
        case "primaryHarmType":
          aValue = a.incidentBlock.primaryHarmType
          bValue = b.incidentBlock.primaryHarmType
          break
        case "country":
          aValue = a.incidentBlock.country || ""
          bValue = b.incidentBlock.country || ""
          break
        case "platformCount":
          aValue = a.incidentBlock.affectedPlatforms?.length || 0
          bValue = b.incidentBlock.affectedPlatforms?.length || 0
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredIncidents(filtered)
  }, [searchTerm, incidents, filters, sortField, sortDirection])

  useEffect(() => {
    fetchData()
  }, [auth])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleFilterChange = (filterType: keyof FilterState, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      harmType: [],
      country: [],
      dateRange: "all",
      platformCount: "all",
    })
    setSearchTerm("")
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getActiveFilterCount = () => {
    return (
      filters.status.length +
      filters.harmType.length +
      filters.country.length +
      (filters.dateRange !== "all" ? 1 : 0) +
      (filters.platformCount !== "all" ? 1 : 0)
    )
  }

  if (auth.isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border max-w-md">
          <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be signed in to view your reports.</p>
          <Button onClick={() => auth.signinRedirect()} className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const statusCounts = incidents.reduce(
    (acc, incident) => {
      const status = transformStatus(incident.status).toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <DashboardLayout currentStep="reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-1">View and manage your submitted incident reports</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.draft || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.resolved || statusCounts.completed || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by case ID, harm type, country, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white border shadow-lg z-50" align="end">
                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">Status</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.statuses.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.status.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleFilterChange("status", [...filters.status, status])
                                } else {
                                  handleFilterChange(
                                    "status",
                                    filters.status.filter((s) => s !== status),
                                  )
                                }
                              }}
                            />
                            <label htmlFor={`status-${status}`} className="text-sm capitalize cursor-pointer">
                              {status.replace("_", " ")}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Harm Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">Harm Type</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.harmTypes.map((harmType) => (
                          <div key={harmType} className="flex items-center space-x-2">
                            <Checkbox
                              id={`harm-${harmType}`}
                              checked={filters.harmType.includes(harmType)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleFilterChange("harmType", [...filters.harmType, harmType])
                                } else {
                                  handleFilterChange(
                                    "harmType",
                                    filters.harmType.filter((h) => h !== harmType),
                                  )
                                }
                              }}
                            />
                            <label htmlFor={`harm-${harmType}`} className="text-sm cursor-pointer">
                              {harmType}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Country Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">Country</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                        {filterOptions.countries.map((country) => (
                          <div key={country} className="flex items-center space-x-2">
                            <Checkbox
                              id={`country-${country}`}
                              checked={filters.country.includes(country)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleFilterChange("country", [...filters.country, country])
                                } else {
                                  handleFilterChange(
                                    "country",
                                    filters.country.filter((c) => c !== country),
                                  )
                                }
                              }}
                            />
                            <label htmlFor={`country-${country}`} className="text-sm cursor-pointer">
                              {country}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">Date Range</label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) => handleFilterChange("dateRange", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="7days">Last 7 Days</SelectItem>
                          <SelectItem value="30days">Last 30 Days</SelectItem>
                          <SelectItem value="90days">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Platform Count Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">Platform Count</label>
                      <Select
                        value={filters.platformCount}
                        onValueChange={(value) => handleFilterChange("platformCount", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="single">Single Platform</SelectItem>
                          <SelectItem value="multiple">Multiple Platforms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sort by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("createdAt")}
                className={sortField === "createdAt" ? "bg-gray-100" : ""}
              >
                Date {getSortIcon("createdAt")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("status")}
                className={sortField === "status" ? "bg-gray-100" : ""}
              >
                Status {getSortIcon("status")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("primaryHarmType")}
                className={sortField === "primaryHarmType" ? "bg-gray-100" : ""}
              >
                Harm Type {getSortIcon("primaryHarmType")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("platformCount")}
                className={sortField === "platformCount" ? "bg-gray-100" : ""}
              >
                Platforms {getSortIcon("platformCount")}
              </Button>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.status.map((status) => (
                  <Badge key={status} variant="secondary" className="gap-1">
                    Status: {status}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange(
                          "status",
                          filters.status.filter((s) => s !== status),
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.harmType.map((harmType) => (
                  <Badge key={harmType} variant="secondary" className="gap-1">
                    {harmType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange(
                          "harmType",
                          filters.harmType.filter((h) => h !== harmType),
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.country.map((country) => (
                  <Badge key={country} variant="secondary" className="gap-1">
                    {country}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange(
                          "country",
                          filters.country.filter((c) => c !== country),
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.dateRange !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.dateRange === "7days"
                      ? "Last 7 Days"
                      : filters.dateRange === "30days"
                        ? "Last 30 Days"
                        : filters.dateRange === "90days"
                          ? "Last 90 Days"
                          : filters.dateRange}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("dateRange", "all")} />
                  </Badge>
                )}
                {filters.platformCount !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.platformCount === "single" ? "Single Platform" : "Multiple Platforms"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("platformCount", "all")} />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {filteredIncidents.length} of {incidents.length} reports
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Reports</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <Button variant="outline" size="sm" onClick={fetchData} className="mt-3 ml-0 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Reports List */}
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || getActiveFilterCount() > 0 ? "No matching reports found" : "No reports yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || getActiveFilterCount() > 0
                  ? "Try adjusting your search terms or filters to see more results."
                  : "You haven't submitted any incident reports yet. Start by creating your first report."}
              </p>
              {searchTerm || getActiveFilterCount() > 0 ? (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              ) : (
                <Button onClick={() => (window.location.href = "/")}>Create First Report</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIncidents.map((incident) => (
              <Card key={incident.incidentId} className="hover:shadow-md transition-shadow border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getHarmTypeColor(incident.incidentBlock.primaryHarmType)}>
                          {incident.incidentBlock.primaryHarmType}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(transformStatus(incident.status))}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transformStatus(incident.status))}
                            {transformStatus(incident.status).replace("_", " ").toUpperCase()}
                          </div>
                        </Badge>
                        {incident.incidentBlock.affectedPlatforms &&
                          incident.incidentBlock.affectedPlatforms.length > 1 && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                              {incident.incidentBlock.affectedPlatforms.length} Platforms
                            </Badge>
                          )}
                      </div>
                      <CardTitle className="text-lg">Case #{incident.incidentId.slice(-8)}</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIncident(incident)}
                      className="shrink-0"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(incident.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {incident.incidentBlock.country || "Unknown"}
                        {incident.incidentBlock.city ? `, ${incident.incidentBlock.city}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {incident.incidentBlock.violationReason || "No description provided"}
                    </p>
                  </div>

                  {incident.incidentBlock.platformsSummary && incident.incidentBlock.platformsSummary.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {incident.incidentBlock.platformsSummary.map((platform, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                {isUnverifiedDraft(incident) && (
                  <div className="border-t px-6 py-4 bg-yellow-50 flex items-center justify-between">
                    <div className="text-yellow-800 text-sm font-medium">
                      This report needs identity verification to proceed.
                    </div>
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => (window.location.href = `/identity-verification/${incident.incidentId}`)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Identity
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Modal for Incident Details */}
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIncident(null)} />

            {/* Modal Content */}
            <Card className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
              <CardHeader className="border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Incident Details</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Case #{selectedIncident.incidentId}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIncident(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Submitter Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>{" "}
                          {selectedIncident.userBlock.firstName} {selectedIncident.userBlock.lastName}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          {selectedIncident.userBlock.emailAddress}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">User ID:</span>{" "}
                          <code className="text-xs bg-gray-100 px-1 rounded">{selectedIncident.userId}</code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Case Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>{" "}
                          <Badge className={getStatusColor(transformStatus(selectedIncident.status))}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(transformStatus(selectedIncident.status))}
                              {transformStatus(selectedIncident.status).replace("_", " ").toUpperCase()}
                            </div>
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Submitted:</span>{" "}
                          {new Date(selectedIncident.createdAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(selectedIncident.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>{" "}
                          {selectedIncident.incidentBlock.country || "Unknown"}
                          {selectedIncident.incidentBlock.city ? `, ${selectedIncident.incidentBlock.city}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Incident Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Harm Type:</span>{" "}
                          <Badge className={getHarmTypeColor(selectedIncident.incidentBlock.primaryHarmType)}>
                            {selectedIncident.incidentBlock.primaryHarmType}
                          </Badge>
                        </div>
                        {selectedIncident.incidentBlock.platformForDynamicQuestions && (
                          <div>
                            <span className="font-medium text-gray-700">Primary Platform:</span>{" "}
                            {selectedIncident.incidentBlock.platformForDynamicQuestions}
                          </div>
                        )}
                        {selectedIncident.incidentBlock.incidentClassification && (
                          <div>
                            <span className="font-medium text-gray-700">Classification:</span>{" "}
                            {selectedIncident.incidentBlock.incidentClassification}
                          </div>
                        )}
                        {selectedIncident.incidentBlock.violationCode && (
                          <div>
                            <span className="font-medium text-gray-700">Violation Code:</span>{" "}
                            {selectedIncident.incidentBlock.violationCode}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Affected Platforms
                      </h3>
                      <div className="space-y-2">
                        {selectedIncident.incidentBlock.affectedPlatforms.map((platform, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary">{platform.platform}</Badge>
                              <span className="text-xs text-gray-600">
                                {platform.userCount} user{platform.userCount !== 1 ? "s" : ""} affected
                              </span>
                            </div>
                            <div className="space-y-1">
                              {platform.profileUrls.map((url, urlIndex) => (
                                <div key={urlIndex} className="text-xs text-gray-600 flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="truncate">{url}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Full Description</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedIncident.incidentBlock.violationReason || "No description provided"}
                  </p>
                </div>

                {/* Dynamic Extras for Impersonation/Fraud cases */}
                {selectedIncident.incidentBlock.dynamicExtras && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedIncident.incidentBlock.dynamicExtras.realAccountUrl && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-medium text-blue-900">Real Account URL:</span>
                          <p className="text-sm text-blue-800 mt-1 break-all">
                            {selectedIncident.incidentBlock.dynamicExtras.realAccountUrl}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.dynamicExtras.fakeAccountUrls && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="font-medium text-red-900">Fake Account URLs:</span>
                          <p className="text-sm text-red-800 mt-1 break-all">
                            {selectedIncident.incidentBlock.dynamicExtras.fakeAccountUrls}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.dynamicExtras.proofOfRealAccount && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <span className="font-medium text-green-900">Proof of Real Account:</span>
                          <p className="text-sm text-green-800 mt-1">
                            {selectedIncident.incidentBlock.dynamicExtras.proofOfRealAccount}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.dynamicExtras.sumSubVerificationId && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <span className="font-medium text-purple-900">Verification ID:</span>
                          <p className="text-sm text-purple-800 mt-1 font-mono">
                            {selectedIncident.incidentBlock.dynamicExtras.sumSubVerificationId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Context */}
                {(selectedIncident.incidentBlock.culturalContext ||
                  selectedIncident.incidentBlock.typeOfSupportProvided ||
                  selectedIncident.incidentBlock.hackedElsewhereDetails ||
                  selectedIncident.incidentBlock.crossPlatformDetails) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Context</h3>
                    <div className="space-y-3">
                      {selectedIncident.incidentBlock.culturalContext && (
                        <div>
                          <span className="font-medium text-gray-700">Cultural Context:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.culturalContext}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.typeOfSupportProvided && (
                        <div>
                          <span className="font-medium text-gray-700">Support Provided:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.typeOfSupportProvided}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.hackedElsewhereDetails && (
                        <div>
                          <span className="font-medium text-gray-700">Other Platforms Affected:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.hackedElsewhereDetails}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.crossPlatformDetails && (
                        <div>
                          <span className="font-medium text-gray-700">Cross-Platform Details:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.crossPlatformDetails}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
