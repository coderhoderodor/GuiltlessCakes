import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { INQUIRY_STATUSES } from '@/lib/constants';

async function getInquiries(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('inquiries')
    .select(`
      *,
      profile:profiles (first_name, last_name, phone),
      images:inquiry_images (image_url)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;
  return data || [];
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  const selectedStatus = status || 'all';
  const inquiries = await getInquiries(selectedStatus);

  // Count by status
  const allInquiries = await getInquiries();
  const statusCounts = INQUIRY_STATUSES.reduce((acc, s) => {
    acc[s.value] = allInquiries.filter((i) => i.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="py-8">
      <div className="container">
        <Link
          href="/admin"
          className="inline-flex items-center text-neutral-600 hover:text-pink-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Custom Cake Inquiries
          </h1>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/admin/inquiries">
            <Button
              variant={selectedStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
            >
              All ({allInquiries.length})
            </Button>
          </Link>
          {INQUIRY_STATUSES.filter((s) => statusCounts[s.value] > 0).map((s) => (
            <Link key={s.value} href={`/admin/inquiries?status=${s.value}`}>
              <Button
                variant={selectedStatus === s.value ? 'primary' : 'outline'}
                size="sm"
              >
                {s.label} ({statusCounts[s.value]})
              </Button>
            </Link>
          ))}
        </div>

        {/* Inquiries List */}
        {inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inquiry) => {
              const statusInfo = INQUIRY_STATUSES.find(
                (s) => s.value === inquiry.status
              );

              return (
                <Card key={inquiry.id} variant="outlined">
                  <CardContent>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-neutral-800 capitalize">
                            {inquiry.event_type.replace('_', ' ')} Cake
                          </h3>
                          <Badge className={statusInfo?.color}>
                            {statusInfo?.label}
                          </Badge>
                        </div>

                        <p className="text-neutral-600">
                          {inquiry.profile?.first_name} {inquiry.profile?.last_name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {inquiry.profile?.phone}
                        </p>

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-500">Event Date</p>
                            <p className="font-medium text-neutral-800">
                              {formatDate(inquiry.event_date).split(',')[0]}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Servings</p>
                            <p className="font-medium text-neutral-800">
                              {inquiry.servings}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Tiers</p>
                            <p className="font-medium text-neutral-800">
                              {inquiry.tiers}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Shape</p>
                            <p className="font-medium text-neutral-800 capitalize">
                              {inquiry.shape}
                            </p>
                          </div>
                        </div>

                        {/* Inspiration Images Thumbnails */}
                        {inquiry.images?.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {inquiry.images.slice(0, 3).map((img: { image_url: string }, i: number) => (
                              <div
                                key={i}
                                className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden"
                              >
                                <img
                                  src={img.image_url}
                                  alt={`Inspiration ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {inquiry.images.length > 3 && (
                              <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">
                                +{inquiry.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-neutral-500">
                          Submitted {formatDate(inquiry.created_at).split(',')[0]}
                        </p>
                        <Link href={`/admin/inquiries/${inquiry.id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="outlined">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">
                No {selectedStatus !== 'all' ? selectedStatus : ''} inquiries
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
