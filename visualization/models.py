from django.db import models

class Vehicle(models.Model):
    vehicle_id = models.CharField(max_length=100, unique=True)
    price = models.FloatField(null=True, blank=True)
    post_title = models.CharField(max_length=255, null=True, blank=True)
    seller_name = models.CharField(max_length=255, null=True, blank=True)
    seller_policy = models.CharField(max_length=1000, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    sold = models.IntegerField(default=0)
    selling = models.IntegerField(default=1)
    description = models.CharField(max_length=1000, null=True, blank=True)
    vehicle_features = models.CharField(max_length=1000, null=True, blank=True)
    posting_time = models.CharField(max_length=50, null=True, blank=True)
    image_links = models.CharField(max_length=1000, null=True, blank=True)
    post_link = models.CharField(max_length=500, null=True, blank=True)
    comment_link = models.CharField(max_length=500, null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    model = models.CharField(max_length=100, null=True, blank=True)
    registration_year = models.FloatField(null=True, blank=True)
    kilometers_used = models.FloatField(null=True, blank=True)
    condition = models.CharField(max_length=100, null=True, blank=True)
    vehicle_type = models.CharField(max_length=100, null=True, blank=True)
    origin_country = models.CharField(max_length=100, null=True, blank=True)
    warranty_policy = models.CharField(max_length=1000, null=True, blank=True)
    weight = models.CharField(max_length=50, null=True, blank=True)
    engine_capacity = models.CharField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    num_ratings = models.FloatField(null=True, blank=True)
    on_time = models.FloatField(default=0.0)
    polite_friendly_communication = models.FloatField(default=0.0)
    reliable = models.FloatField(default=0.0)
    accurate_product_description = models.FloatField(default=0.0)
    product_quality_good = models.FloatField(default=0.0)
    good_price_product = models.FloatField(default=0.0)
    link = models.CharField(max_length=500, null=True, blank=True)
    fast_message_response = models.FloatField(default=0.0)
    reasonable_price_negotiation = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.vehicle_id})"

    class Meta:
        db_table = 'vehicles'