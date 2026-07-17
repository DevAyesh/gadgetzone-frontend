export default function AdminCustomersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
        <p className="text-lg">Customer management will be available after we integrate Supabase Auth profiles.</p>
      </div>
    </div>
  );
}
