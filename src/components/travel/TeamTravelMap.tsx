import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface TeamTravelMapProps {
  user: User;
}

export function TeamTravelMap({ user }: TeamTravelMapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Reise-Karte</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Live-Karte für Team-Reisen wird hier implementiert...</p>
      </CardContent>
    </Card>
  );
}