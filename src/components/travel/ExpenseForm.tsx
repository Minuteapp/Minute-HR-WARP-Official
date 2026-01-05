import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ExpenseFormProps {
  user: User;
  onSubmit: () => void;
}

export function ExpenseForm({ user, onSubmit }: ExpenseFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spesenabrechnung</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Spesenformular wird hier implementiert...</p>
      </CardContent>
    </Card>
  );
}