import {
    GigJob,
    CreateGigJobData,
    GigSearchFilters,
    JobApplication,
    JobRating
} from '../types/gig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class GigService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem('token');
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    }

    // Create a new gig job
    async createGigJob(jobData: CreateGigJobData): Promise<GigJob> {
        return this.request<GigJob>('/gigs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    // Get a specific gig job by ID
    async getGigJobById(jobId: string): Promise<GigJob> {
        return this.request<GigJob>(`/gigs/${jobId}`);
    }

    // Update a gig job
    async updateGigJob(jobId: string, updates: Partial<CreateGigJobData>): Promise<GigJob> {
        return this.request<GigJob>(`/gigs/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    // Delete a gig job
    async deleteGigJob(jobId: string): Promise<void> {
        await this.request<void>(`/gigs/${jobId}`, {
            method: 'DELETE',
        });
    }

    // Search and filter gig jobs
    async searchGigJobs(filters: GigSearchFilters = {}, limit: number = 20, skip: number = 0): Promise<GigJob[]> {
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.minPayment !== undefined) params.append('minPayment', filters.minPayment.toString());
        if (filters.maxPayment !== undefined) params.append('maxPayment', filters.maxPayment.toString());
        if (filters.paymentType) params.append('paymentType', filters.paymentType);
        if (filters.maxDistance !== undefined) params.append('maxDistance', filters.maxDistance.toString());
        if (filters.userLocation) {
            params.append('userLocation', filters.userLocation.join(','));
        }
        if (filters.skillIds && filters.skillIds.length > 0) {
            params.append('skillIds', filters.skillIds.join(','));
        }
        if (filters.status) params.append('status', filters.status);
        params.append('limit', limit.toString());
        params.append('skip', skip.toString());

        return this.request<GigJob[]>(`/gigs?${params.toString()}`);
    }

    // Apply for a gig job
    async applyForJob(jobId: string, message: string): Promise<GigJob> {
        return this.request<GigJob>(`/gigs/${jobId}/apply`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    }

    // Select a worker for a job
    async selectWorker(jobId: string, workerId: string): Promise<GigJob> {
        return this.request<GigJob>(`/gigs/${jobId}/select-worker`, {
            method: 'POST',
            body: JSON.stringify({ workerId }),
        });
    }

    // Mark job as completed
    async completeJob(jobId: string): Promise<GigJob> {
        return this.request<GigJob>(`/gigs/${jobId}/complete`, {
            method: 'POST',
        });
    }

    // Rate a completed job
    async rateJob(jobId: string, rating: number, review: string, raterRole: 'poster' | 'worker'): Promise<GigJob> {
        return this.request<GigJob>(`/gigs/${jobId}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating, review, raterRole }),
        });
    }

    // Get jobs posted by the authenticated user
    async getUserPostedJobs(status?: string): Promise<GigJob[]> {
        const params = status ? `?status=${status}` : '';
        return this.request<GigJob[]>(`/gigs/user/posted${params}`);
    }

    // Get jobs the authenticated user has applied to
    async getUserApplications(): Promise<GigJob[]> {
        return this.request<GigJob[]>('/gigs/user/applications');
    }

    // Get jobs assigned to the authenticated user
    async getUserAssignedJobs(status?: string): Promise<GigJob[]> {
        const params = status ? `?status=${status}` : '';
        return this.request<GigJob[]>(`/gigs/user/assigned${params}`);
    }
}

export const gigService = new GigService();
