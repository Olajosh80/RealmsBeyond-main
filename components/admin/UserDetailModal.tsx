import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiShield } from 'react-icons/fi';

interface UserDetailModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Customer Details"
            className="bg-white text-gray-900 border border-gray-200"
        >
            <div className="space-y-6">
                {/* Header Profile Section */}
                <div className="flex flex-col items-center justify-center pb-6 border-b border-gray-100">
                    <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 mb-4 border-4 border-gray-50 shadow-md">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.full_name || 'No Name'}</h2>
                    <span className="mt-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                        {user.role || 'User'}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-white rounded-lg text-rare-primary shadow-sm">
                                <FiMail className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Address</span>
                        </div>
                        <p className="pl-11 text-gray-900 break-all font-medium">{user.email}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-white rounded-lg text-rare-primary shadow-sm">
                                <FiPhone className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone Number</span>
                        </div>
                        <p className="pl-11 text-gray-900 font-medium">{user.phone || 'N/A'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-white rounded-lg text-rare-primary shadow-sm">
                                <FiCalendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Joined Date</span>
                        </div>
                        <p className="pl-11 text-gray-900 font-medium">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Unknown'}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-white rounded-lg text-rare-primary shadow-sm">
                                <FiShield className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Account ID</span>
                        </div>
                        <p className="pl-11 text-xs text-gray-500 font-mono">{user._id || user.id}</p>
                    </div>
                </div>

                {/* Future Section: Recent Orders or Activity */}
                {/* 
        <div className="pt-4 border-t border-gray-200">
           <h4 className="text-sm font-bold text-gray-700 mb-3">Recent Activity</h4>
           <p className="text-sm text-gray-500 italic">No recent activity recorded.</p>
        </div>
        */}

            </div>
        </Modal>
    );
};
