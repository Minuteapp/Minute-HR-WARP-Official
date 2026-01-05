import React, { useState } from 'react';
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Heart, ChevronRight, Calendar, MapPin, Plane, Building, Euro, Star, Clock, User, CreditCard, Navigation, FileText, Phone, Mail, Briefcase, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "../ui/ImageWithFallback";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface TravelRequest {
  id: string;
  title: string;
  description: string;
  employee: {
    name: string;
    department: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
  destination: {
    country: string;
    city: string;
    image: string;
    coordinates?: { lat: number; lng: number };
    landmark?: string;
    timeZone?: string;
  };
  dates: {
    start: string;
    end: string;
    duration: string;
  };
  hotel: {
    name: string;
    rating: number;
    nights: number;
    address?: string;
    checkIn?: string;
    checkOut?: string;
  };
  flight: {
    airline: string;
    flightNumber: string;
    class: string;
    departure?: string;
    arrival?: string;
    departureAirport?: string;
    arrivalAirport?: string;
  };
  budget: {
    used: number;
    total: number;
    currency: string;
    breakdown?: {
      flight: number;
      hotel: number;
      meals: number;
      transport: number;
      other: number;
    };
  };
  status: 'upcoming' | 'active' | 'completed' | 'pending';
  priority: 'low' | 'normal' | 'high';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  daysUntil: number;
  purpose?: string;
  notes?: string;
  approver?: string;
  requestedDate?: string;
}

interface TravelCardsProps {
  user: User;
}

export function TravelCards({ user }: TravelCardsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedTrip, setSelectedTrip] = useState<TravelRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const mockTravelRequests: TravelRequest[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const toggleFavorite = (tripId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tripId)) {
      newFavorites.delete(tripId);
    } else {
      newFavorites.add(tripId);
    }
    setFavorites(newFavorites);
  };

  const getFilteredTrips = (status: string) => {
    if (status === 'preview') return mockTravelRequests;
    return mockTravelRequests.filter(trip => trip.status === status);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const openTripDetails = (trip: TravelRequest) => {
    setSelectedTrip(trip);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* New Business Trip Button */}
      <Button 
        className="w-full h-14 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        size="lg"
      >
        <span className="text-xl mr-2">+</span>
        New Business Trip
      </Button>

      {/* Trip Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
          <TabsTrigger 
            value="preview" 
            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white text-gray-600"
          >
            Preview Trips
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming"
            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white text-gray-600"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white text-gray-600"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white text-gray-600"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        {(['preview', 'upcoming', 'active', 'completed'] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {getFilteredTrips(status).map((trip) => (
                <Card key={trip.id} className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    {/* Hero Image with Enhanced Location Recognition */}
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={trip.destination.image}
                        alt={`${trip.destination.city}, ${trip.destination.country}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Status Badges - Top Left */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {getStatusBadge(trip.status)}
                        {getApprovalBadge(trip.approvalStatus)}
                      </div>

                      {/* Favorite Button - Top Right */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => toggleFavorite(trip.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.has(trip.id) ? 'fill-red-500 text-red-500' : 'text-white'
                          }`}
                        />
                      </Button>

                      {/* Enhanced Location Information */}
                      <div className="absolute bottom-4 left-4 right-16">
                        <div className="text-white">
                          <div className="text-sm opacity-90 mb-1">{trip.destination.country}</div>
                          <div className="text-xl font-semibold mb-1">{trip.destination.city}</div>
                          {trip.destination.landmark && (
                            <div className="text-xs opacity-80 flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {trip.destination.landmark}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Yellow Details Button */}
                      <Button
                        className="absolute bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full h-12 w-12 p-0 shadow-lg"
                        onClick={() => openTripDetails(trip)}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Trip Details */}
                    <CardContent className="p-6 space-y-4">
                      {/* Title and Priority */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {trip.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {trip.description}
                          </p>
                        </div>
                        {getPriorityBadge(trip.priority)}
                      </div>

                      {/* Employee Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {trip.employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{trip.employee.name}</div>
                          <div className="text-xs text-gray-600">{trip.employee.department}</div>
                        </div>
                        <div className="ml-auto text-xs text-gray-500">
                          {trip.daysUntil > 0 ? `${trip.daysUntil} days` : 'Past'}
                        </div>
                      </div>

                      {/* Trip Details Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        {/* Dates */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">Dates</span>
                          </div>
                          <div className="text-sm font-medium">{trip.dates.start}</div>
                          <div className="text-xs text-gray-600">to {trip.dates.end}</div>
                        </div>

                        {/* Hotel */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="h-4 w-4" />
                            <span className="text-xs font-medium">Hotel</span>
                          </div>
                          <div className="text-sm font-medium">{trip.hotel.name}</div>
                          <div className="flex items-center gap-1">
                            {renderStars(trip.hotel.rating)}
                            <span className="text-xs text-gray-600 ml-1">• {trip.hotel.nights} nights</span>
                          </div>
                        </div>

                        {/* Flight */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Plane className="h-4 w-4" />
                            <span className="text-xs font-medium">Flight</span>
                          </div>
                          <div className="text-sm font-medium">{trip.flight.airline}</div>
                          <div className="text-xs text-gray-600">
                            {trip.flight.flightNumber} • {trip.flight.class}
                          </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Euro className="h-4 w-4" />
                            <span className="text-xs font-medium">Budget</span>
                          </div>
                          <div className="text-sm font-medium">
                            {trip.budget.used}/{trip.budget.total} {trip.budget.currency}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((trip.budget.used / trip.budget.total) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}

              {getFilteredTrips(status).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Reisen in dieser Kategorie</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}