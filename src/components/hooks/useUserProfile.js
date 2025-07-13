/**
 * Created by fulle on 2025/07/12.
 */
import { useState, useEffect } from 'react';

const useUserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Simulated API call to fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // Mock data
                setProfile({
                    id: 'user-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@healthcare.org',
                    phone: '+1 (555) 123-4567',
                    jobTitle: 'Senior Health Inspector',
                    department: 'Quality Assurance',
                    bio: '10+ years of experience in healthcare facility inspections. Specialized in surgical unit compliance.',
                    avatar: null,
                    lastUpdated: new Date().toISOString()
                });
            } catch (err) {
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Simulated API call to update profile
    const updateProfile = async (data) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In real app: await api.updateProfile(data);
            setProfile(prev => ({
                ...prev,
                ...data,
                lastUpdated: new Date().toISOString()
            }));

            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return {
        profile,
        loading,
        error,
        success,
        updateProfile
    };
};

export default useUserProfile;