import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface AdminPanelProps {
  user: User;
}

export function AdminPanel({ user }: AdminPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin-Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Administrations-Panel für Reisen wird hier implementiert...</p>
      </CardContent>
    </Card>
  );
}