from django.shortcuts import render
import pandas as pd
from .models import Vehicle

def main(request):
    return render(request, 'main.html')
def upload_csv(request):
    if request.method == 'POST' and request.FILES.get('csv_file'):
        csv_file = request.FILES['csv_file']
        if not csv_file.name.endswith('.csv'):
            return render(request, 'upload_csv.html', {
                'message': 'Please upload a valid CSV file.',
                'error': True
            })

        try:
            # Đọc file CSV
            df = pd.read_csv(csv_file)

            # Chuyển đổi và lưu dữ liệu
            for _, row in df.iterrows():
                vehicle_data = {
                    'vehicle_id': row.get('vehicle_id'),
                    'price': row.get('price'),
                    'post_title': row.get('post_title'),
                    'seller_name': row.get('seller_name'),
                    'seller_policy': row.get('seller_policy'),
                    'location': row.get('location'),
                    'sold': int(row.get('sold', 0)),
                    'selling': int(row.get('selling', 0)),
                    'description': row.get('description'),
                    'vehicle_features': row.get('vehicle_features'),
                    'posting_time': row.get('posting_time'),
                    'image_links': row.get('image_links'),
                    'post_link': row.get('post_link'),
                    'comment_link': row.get('comment_link'),
                    'brand': row.get('brand'),
                    'model': row.get('model'),
                    'registration_year': row.get('registration_year'),
                    'kilometers_used': row.get('kilometers_used'),
                    'condition': row.get('condition'),
                    'vehicle_type': row.get('vehicle_type'),
                    'origin_country': row.get('origin_country'),
                    'warranty_policy': row.get('warranty_policy'),
                    'weight': row.get('weight') if pd.notna(row.get('weight')) else None,
                    'engine_capacity': row.get('engine_capacity'),
                    'city': row.get('city'),
                    'rating': row.get('rating'),
                    'num_ratings': row.get('num_ratings'),
                    'on_time': float(row.get('on_time', 0.0)),
                    'polite_friendly_communication': float(row.get('polite_friendly_communication', 0.0)),
                    'reliable': float(row.get('reliable', 0.0)),
                    'accurate_product_description': float(row.get('accurate_product_description', 0.0)),
                    'product_quality_good': float(row.get('product_quality_good', 0.0)),
                    'good_price_product': float(row.get('good_price_product', 0.0)),
                    'link': row.get('link') if pd.notna(row.get('link')) else None,
                    'fast_message_response': float(row.get('fast_message_response', 0.0)),
                    'reasonable_price_negotiation': float(row.get('reasonable_price_negotiation', 0.0)),
                }

                # Lưu vào cơ sở dữ liệu
                Vehicle.objects.update_or_create(
                    vehicle_id=vehicle_data['vehicle_id'],
                    defaults=vehicle_data
                )

            return render(request, 'upload_csv.html', {
                'message': 'CSV file processed successfully!'
            })

        except Exception as e:
            return render(request, 'upload_csv.html', {
                'message': f'Error processing CSV file: {str(e)}',
                'error': True
            })

    return render(request, 'upload_csv.html')

import json
def dashboard(request):
    # Lấy tất cả dữ liệu từ model Vehicle
    vehicles = Vehicle.objects.all().values(
        'seller_name', 'city', 'rating', 'price', 'brand',
        'reasonable_price_negotiation', 'good_price_product', 'product_quality_good',
        'accurate_product_description', 'reliable', 'polite_friendly_communication',
        'on_time', 'fast_message_response'
    )
    # Chuyển thành JSON
    vehicle_data = json.dumps(list(vehicles), ensure_ascii=False)
    return render(request, 'dashboard.html', {
        'vehicle_data': vehicle_data
    })
def dash2(request):
    vehicles = Vehicle.objects.all().values(
        'vehicle_id', 'city', 'warranty_policy', 'engine_capacity', 'price',
        'kilometers_used', 'registration_year', 'condition', 'vehicle_type'
    )
    vehicle_data = json.dumps(list(vehicles), ensure_ascii=False)
    return render(request, 'dash2.html', {
        'vehicle_data': vehicle_data
    })
def dash3(request):
    vehicles = Vehicle.objects.all().values(
        'vehicle_id', 'seller_name', 'city', 'seller_policy', 'sold', 'selling',
        'price', 'vehicle_type', 'rating', 'num_ratings',
        'reasonable_price_negotiation', 'fast_message_response', 'good_price_product',
        'product_quality_good', 'accurate_product_description', 'reliable',
        'polite_friendly_communication', 'on_time'
    )
    vehicle_data = json.dumps(list(vehicles), ensure_ascii=False)
    return render(request, 'dash3.html', {
        'vehicle_data': vehicle_data
    })