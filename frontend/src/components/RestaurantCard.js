import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const { _id, name, image, description, location, cuisine, rating, deliveryTime, minOrder, isOpen } = restaurant;

  return (
    <Link to={`/restaurant/${_id}`} className="block">
      <div className="card overflow-hidden group cursor-pointer">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={image || `https://source.unsplash.com/400x300/?restaurant,food,${name}`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'; }}
          />
          {!isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded-full text-sm">Closed</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-semibold text-gray-700">{rating?.toFixed(1)}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{name}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-1">{cuisine}</p>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{location}</span>
            </div>
            <div className="ml-auto">
              <span className="text-gray-400">Min: </span>
              <span className="font-medium text-gray-600">₹{minOrder}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
