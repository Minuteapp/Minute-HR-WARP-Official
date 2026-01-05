import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ExpenseListProps {
  user: User;
}

export function ExpenseList({ user }: ExpenseListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spesen-Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Spesenliste wird hier angezeigt...</p>
      </CardContent>
    </Card>
  );
}