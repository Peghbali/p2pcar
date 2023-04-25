json.extract! car, 
    :id,      
    :make,
    :model,
    :year,
    :mpg,
    :doors_count,
    :seats_count,
    :category,
    :automatic,
    :description,
    :guidelines,
    :daily_rate,
    :location,
    :active,
    :host_id,
    :created_at
  
if car.photos.attached?
  photos = []
  car.photos.each do |photo|
    photos << url_for(photo)
  end
  json.photos_url photos
end

json.host do
    json.partial! 'api/users/user', user: car.host
end